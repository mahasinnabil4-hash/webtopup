import { NextResponse } from 'next/server'
import { verifyWebhook, parsePaymentStatus, parsePaymentMethod } from '@/lib/payments/factory'
import { getPaymentByGatewayTransactionId, updatePaymentStatus, createPaymentLog } from '@/lib/db/queries/payments'
import { updateOrderStatus } from '@/lib/db/queries/orders'
import { createSupplierTransaction, getSupplierByCode, getSupplierProductMapping } from '@/lib/db/queries/suppliers'
import { submitOrderToSupplier } from '@/lib/suppliers/processor'
import { createActivityLog } from '@/lib/db/queries/activity-logs'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const verification = verifyWebhook(payload, 'midtrans')
    
    await createPaymentLog({
      paymentId: undefined,
      eventType: 'webhook_received',
      payload,
      ipAddress: clientIp,
      userAgent,
    })

    if (!verification.isValid || !verification.payload) {
      await createPaymentLog({
        paymentId: undefined,
        eventType: 'webhook_verification_failed',
        payload: { ...payload, error: verification.error },
        ipAddress: clientIp,
        userAgent,
      })
      return NextResponse.json({ status: 'signature verification failed' }, { status: 400 })
    }

    const webhookData = verification.payload
    const orderId = webhookData.order_id
    const transactionId = webhookData.transaction_id
    const transactionStatus = parsePaymentStatus(webhookData.transaction_status || 'PENDING', 'midtrans')
    const paymentMethod = parsePaymentMethod(webhookData.payment_type || 'UNKNOWN', 'midtrans')

    const payment = await getPaymentByGatewayTransactionId(transactionId ?? orderId ?? '')
    if (!payment) {
      await createPaymentLog({
        paymentId: undefined,
        eventType: 'webhook_payment_not_found',
        payload: { orderId, transactionId, transactionStatus },
        ipAddress: clientIp,
        userAgent,
      })
      return NextResponse.json({ status: 'payment not found' }, { status: 404 })
    }

    await updatePaymentStatus(payment.id, transactionStatus as any, {
      gatewayResponse: payload,
      paidAt: transactionStatus === 'SETTLEMENT' ? new Date() : undefined,
      signatureVerified: true,
      callbackPayload: payload,
    })

    await createPaymentLog({
      paymentId: payment.id,
      eventType: 'webhook_verified',
      payload: { transactionStatus, paymentMethod },
      ipAddress: clientIp,
      userAgent,
    })

    if (transactionStatus === 'SETTLEMENT' || transactionStatus === 'CAPTURE') {
      await updateOrderStatus(payment.orderId, 'PAID', { processedAt: new Date() })
      
      const order = await getOrderWithDetails(payment.orderId)
      if (order) {
        await processOrderToSupplier(order)
      }

      await createActivityLog({
        userId: order?.userId,
        action: 'payment_success',
        entityType: 'order',
        entityId: payment.orderId,
        newData: { paymentMethod, transactionId },
        ipAddress: clientIp,
        userAgent,
      })
    } else if (['DENY', 'CANCEL', 'EXPIRE', 'FAILURE'].includes(transactionStatus)) {
      await updateOrderStatus(payment.orderId, 'FAILED', { failedReason: `Payment ${transactionStatus.toLowerCase()}` })
      
      await createActivityLog({
        userId: payment.order?.userId,
        action: 'payment_failed',
        entityType: 'order',
        entityId: payment.orderId,
        newData: { paymentMethod, transactionId, reason: transactionStatus },
        ipAddress: clientIp,
        userAgent,
      })
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Midtrans webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function getOrderWithDetails(orderId: string) {
  const { getOrderById } = await import('@/lib/db/queries/orders')
  return getOrderById(orderId)
}

async function processOrderToSupplier(order: any) {
  const supplier = await getSupplierByCode(order.product.supplierMappings?.[0]?.supplier?.code || 'MANUAL')
  if (!supplier) return

  const mapping = await getSupplierProductMapping(supplier.id, order.productId)
  if (!mapping) return

  await createSupplierTransaction({
    orderId: order.id,
    supplierId: supplier.id,
    requestPayload: {
      productCode: mapping.supplierProductCode,
      gameCode: order.game.supplierMappings?.[0]?.supplierGameCode,
      userId: order.userGameId,
      zoneId: order.userZoneId,
      quantity: order.quantity,
    },
    status: 'PENDING',
  })

  await updateOrderStatus(order.id, 'PROCESSING')
  await submitOrderToSupplier(order.id)
}