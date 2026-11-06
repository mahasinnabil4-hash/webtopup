import { getSupplierTransactionByOrderId, updateSupplierTransaction, getSupplierById } from '@/lib/db/queries/suppliers'
import { getSupplierAdapter, initializeSupplierAdapter } from '@/lib/suppliers/factory'
import { updateOrderStatus } from '@/lib/db/queries/orders'
import { createActivityLog } from '@/lib/db/queries/activity-logs'
import { SupplierAdapter } from '@/lib/suppliers/types'

const MAX_RETRIES = 3
const RETRY_DELAYS = [5000, 30000, 120000]

export async function submitOrderToSupplier(orderId: string): Promise<boolean> {
  const transaction = await getSupplierTransactionByOrderId(orderId)
  if (!transaction) return false

  const supplier = await getSupplierById(transaction.supplierId)
  if (!supplier) return false

  const adapter = getSupplierAdapter(supplier.code)
  if (!adapter) return false

  if (supplier.isManual) {
    await updateSupplierTransaction(transaction.id, {
      status: 'PENDING',
      errorMessage: 'Waiting for manual processing',
    })
    return true
  }

  initializeSupplierAdapter(supplier.code, {
    baseUrl: supplier.baseUrl || undefined,
    apiKey: supplier.apiKey || undefined,
    apiSecret: supplier.apiSecret || undefined,
    username: supplier.username || undefined,
    password: supplier.password || undefined,
    callbackUrl: supplier.callbackUrl || undefined,
    customConfig: supplier.config || undefined,
  })

  return processSupplierOrder(transaction.id, adapter, supplier.code)
}

async function processSupplierOrder(
  transactionId: string,
  adapter: SupplierAdapter,
  supplierCode: string,
  retryCount = 0
): Promise<boolean> {
  const transaction = await getSupplierTransactionByOrderId(
    (await import('@/lib/db/prisma')).prisma.supplierTransaction.findUnique({
      where: { id: transactionId },
      select: { orderId: true },
    }) as any
  ).then((t: any) => t?.orderId ? getSupplierTransactionByOrderId(t.orderId) : null)
  
  if (!transaction) return false

  try {
    const requestPayload = transaction.requestPayload as any
    const response = await adapter.submitOrder({
      orderId: transaction.orderId,
      orderNumber: `ORDER-${transaction.orderId.slice(-8)}`,
      productCode: requestPayload.productCode,
      gameCode: requestPayload.gameCode,
      userId: requestPayload.userId,
      zoneId: requestPayload.zoneId,
      quantity: requestPayload.quantity,
      price: requestPayload.price,
    })

    if (response.success) {
      await updateSupplierTransaction(transactionId, {
        supplierOrderId: response.supplierOrderId,
        responsePayload: response.data,
        status: response.status,
      })

      if (response.status === 'SUCCESS') {
        await updateOrderStatus(transaction.orderId, 'SUCCESS', { completedAt: new Date() })
        await createActivityLog({
          action: 'supplier_success',
          entityType: 'order',
          entityId: transaction.orderId,
          newData: { supplierCode, supplierOrderId: response.supplierOrderId },
        })
        return true
      } else if (response.status === 'FAILED') {
        await handleFailure(transactionId, transaction.orderId, response.message || 'Supplier returned failure')
        return false
      }
      return true
    } else {
      return handleRetry(transactionId, transaction.orderId, adapter, supplierCode, retryCount, response.message || 'Unknown error')
    }
  } catch (error) {
    console.error('Supplier order error:', error)
    return handleRetry(transactionId, transaction.orderId, adapter, supplierCode, retryCount, error instanceof Error ? error.message : 'Exception')
  }
}

async function handleRetry(
  transactionId: string,
  orderId: string,
  adapter: SupplierAdapter,
  supplierCode: string,
  retryCount: number,
  errorMessage: string
): Promise<boolean> {
  if (retryCount >= MAX_RETRIES) {
    await handleFailure(transactionId, orderId, `Max retries exceeded: ${errorMessage}`)
    return false
  }

  await updateSupplierTransaction(transactionId, {
    retryCount: retryCount + 1,
    lastAttemptAt: new Date(),
    errorMessage,
  })

  const delay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1]
  await new Promise((resolve) => setTimeout(resolve, delay))

  return processSupplierOrder(transactionId, adapter, supplierCode, retryCount + 1)
}

async function handleFailure(transactionId: string, orderId: string, errorMessage: string) {
  await updateSupplierTransaction(transactionId, {
    status: 'FAILED',
    errorMessage,
  })
  await updateOrderStatus(orderId, 'FAILED', { failedReason: `Supplier processing failed: ${errorMessage}` })
  
  await createActivityLog({
    action: 'supplier_failed',
    entityType: 'order',
    entityId: orderId,
    newData: { error: errorMessage },
  })
}

export async function checkSupplierOrderStatus(supplierTransactionId: string): Promise<boolean> {
  const transaction = await getSupplierTransactionByOrderId(supplierTransactionId)
  if (!transaction || !transaction.supplierOrderId) return false

  const supplier = await getSupplierById(transaction.supplierId)
  if (!supplier) return false

  const adapter = getSupplierAdapter(supplier.code)
  if (!adapter) return false

  initializeSupplierAdapter(supplier.code, {
    baseUrl: supplier.baseUrl || undefined,
    apiKey: supplier.apiKey || undefined,
    apiSecret: supplier.apiSecret || undefined,
    username: supplier.username || undefined,
    password: supplier.password || undefined,
  })

  try {
    const response = await adapter.checkStatus(transaction.supplierOrderId)
    
    await updateSupplierTransaction(transaction.id, {
      responsePayload: response.data,
      status: response.status,
    })

    if (response.status === 'SUCCESS') {
      await updateOrderStatus(transaction.orderId, 'SUCCESS', { completedAt: new Date() })
      return true
    } else if (response.status === 'FAILED') {
      await handleFailure(transaction.id, transaction.orderId, response.message || 'Supplier status check failed')
      return false
    }
    
    return false
  } catch (error) {
    console.error('Supplier status check error:', error)
    return false
  }
}

export async function processPendingSupplierOrders() {
  const { prisma } = await import('@/lib/db/prisma')
  
  const pendingTransactions = await prisma.supplierTransaction.findMany({
    where: {
      status: { in: ['PENDING', 'PROCESSING'] },
      retryCount: { lt: MAX_RETRIES },
    },
    include: { supplier: true, order: true },
    take: 50,
  })

  for (const transaction of pendingTransactions) {
    if (transaction.supplier.isManual) continue
    
    const adapter = getSupplierAdapter(transaction.supplier.code)
    if (!adapter) continue

    await processSupplierOrder(transaction.id, adapter, transaction.supplier.code, transaction.retryCount)
  }
}