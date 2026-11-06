import { NextResponse } from 'next/server'
import { validateInput, checkOrderSchema } from '@/lib/utils/validation'
import { getOrderByOrderNumber } from '@/lib/db/queries/orders'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = validateInput(checkOrderSchema, body)

    const order = await getOrderByOrderNumber(validated.orderNumber)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (validated.phone && order.user?.phone !== validated.phone) {
      return NextResponse.json({ error: 'Phone number does not match' }, { status: 403 })
    }

    if (validated.email && order.user?.email !== validated.email) {
      return NextResponse.json({ error: 'Email does not match' }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Check order error:', error)
    const message = error instanceof Error ? error.message : 'Failed to check order'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}