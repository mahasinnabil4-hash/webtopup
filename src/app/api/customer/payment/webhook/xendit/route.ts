import { NextResponse } from 'next/server'
import { verifyWebhook, parsePaymentStatus } from '@/lib/payments/factory'
import { getPaymentByGatewayTransactionId, updatePaymentStatus, createPaymentLog } from '@/lib/db/queries/payments'
import { updateOrderStatus } from '@/lib/db/queries/orders'
import { createActivityLog } from '@/lib/db/queries/activity-logs'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const verification = verifyWebhook(payload, 'xendit')
    
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
      return NextResponse.json({ status: 'verification failed' }, { status: 400 })
    }

    const webhookData = verification.payload
    const invoiceId = webhookData.id
    const externalId = webhookData.external_id
    const transactionStatus = parsePaymentStatus(webhookData.status, 'xendit')

    const payment = await getPaymentByGatewayTransactionId(invoiceId || externalId)
    if (!payment) {
      return NextResponse.json({ status: 'payment not found' }, { status: 404 })
    }

    await updatePaymentStatus(payment.id, transactionStatus as any, {
      gatewayResponse: payload,
      paidAt: transactionStatus === 'SETTLEMENT' ? new Date() : undefined,
      signatureVerified: true,
      callbackPayload: payload,
    })

    if (transactionStatus === 'SETTLEMENT') {
      await updateOrderStatus(payment.orderId, 'PAID', { processedAt: new Date() })
      
      await createActivityLog({
        userId: payment.order?.userId,
        action: 'payment_success',
        entityType: 'order',
        entityId: payment.orderId,
        newData: { transactionId: invoiceId },
        ipAddress: clientIp,
        userAgent,
      })
    } else if (['EXPIRE', 'FAILED'].includes(transactionStatus)) {
      await updateOrderStatus(payment.orderId, 'FAILED', { failedReason: `Payment ${transactionStatus.toLowerCase()}` })
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Xendit webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}