import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { getOrderById } from '@/lib/db/queries/orders'
import { createPayment } from '@/lib/db/queries/payments'
import { createPayment as createGatewayPayment } from '@/lib/payments/factory'
import { createActivityLog } from '@/lib/db/queries/activity-logs'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const order = await getOrderById(orderId)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.userId !== session.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (order.status !== 'PENDING' && order.status !== 'WAITING_PAYMENT') {
      return NextResponse.json({ error: 'Order cannot be paid' }, { status: 400 })
    }

    const existingPayment = order.payment
    if (existingPayment && existingPayment.status === 'PENDING') {
      return NextResponse.json({ error: 'Payment already pending' }, { status: 400 })
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const callbackUrl = `${baseUrl}/payment/${order.id}`

    const paymentResponse = await createGatewayPayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.totalPrice.toNumber(),
      customerName: session.user.name || order.userGameId,
      customerEmail: session.user.email || 'customer@nexatopup.com',
      customerPhone: order.user?.phone ?? undefined,
      items: [
        {
          id: order.productId,
          name: `${order.product.name} (${order.game.name})`,
          quantity: order.quantity,
          price: order.unitPrice.toNumber(),
        },
      ],
      callbackUrl,
      expiryMinutes: 24 * 60,
    })

    if (!paymentResponse.success) {
      return NextResponse.json({ error: paymentResponse.error }, { status: 500 })
    }

    const payment = await createPayment({
      orderId: order.id,
      paymentGateway: process.env.PAYMENT_GATEWAY || 'midtrans',
      gatewayTransactionId: paymentResponse.transactionId,
      amount: order.totalPrice.toNumber(),
      expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })

    await createActivityLog({
      userId: session.user.id,
      action: 'create_payment',
      entityType: 'payment',
      entityId: payment.id,
      newData: { gatewayTransactionId: paymentResponse.transactionId },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    await updateOrderStatus(order.id, 'WAITING_PAYMENT')

    return NextResponse.json({
      paymentUrl: paymentResponse.paymentUrl,
      token: paymentResponse.token,
      transactionId: paymentResponse.transactionId,
      vaNumbers: paymentResponse.vaNumbers,
      qrCode: paymentResponse.qrCode,
      qrString: paymentResponse.qrString,
    })
  } catch (error) {
    console.error('Create payment error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create payment'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function updateOrderStatus(orderId: string, status: string) {
  const { updateOrderStatus } = await import('@/lib/db/queries/orders')
  await updateOrderStatus(orderId, status as any)
}