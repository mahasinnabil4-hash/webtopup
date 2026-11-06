import { NextResponse } from 'next/server'
import { validateInput, checkOrderSchema } from '@/lib/utils/validation'
import { getOrderByOrderNumber } from '@/lib/db/queries/orders'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')
    const phone = searchParams.get('phone') || undefined
    const email = searchParams.get('email') || undefined

    if (!orderNumber) {
      return NextResponse.json({ error: 'Order number is required' }, { status: 400 })
    }

    const order = await getOrderByOrderNumber(orderNumber)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (phone && order.user?.phone !== phone) {
      return NextResponse.json({ error: 'Phone number does not match' }, { status: 403 })
    }

    if (email && order.user?.email !== email) {
      return NextResponse.json({ error: 'Email does not match' }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Check order error:', error)
    return NextResponse.json({ error: 'Failed to check order' }, { status: 500 })
  }
}