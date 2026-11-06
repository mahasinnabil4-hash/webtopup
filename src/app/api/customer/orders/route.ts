import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { createOrder } from '@/lib/db/queries/orders'
import { getProductById } from '@/lib/db/queries/products'
import { validateInput, createOrderSchema } from '@/lib/utils/validation'
import { createPayment } from '@/lib/payments/factory'

export async function POST(request: Request) {
  try {
    const session = await auth()
    const body = await request.json()
    const validated = validateInput(createOrderSchema, body)

    const product = await getProductById(validated.productId)
    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Product not found or inactive' }, { status: 404 })
    }

    if (!product.game.isActive) {
      return NextResponse.json({ error: 'Game is not active' }, { status: 400 })
    }

    const unitPrice = product.sellPrice.toNumber()
    const quantity = validated.quantity ?? 1
    const totalPrice = unitPrice * quantity

    const userId = session?.user?.id || 'guest'
    const userEmail = session?.user?.email || 'guest@nexatopup.com'
    const userName = session?.user?.name || 'Guest'

    const order = await createOrder({
      userId,
      productId: product.id,
      gameId: product.gameId,
      userGameId: validated.userGameId,
      userZoneId: validated.userZoneId,
      quantity: quantity,
      unitPrice,
      totalPrice,
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Create order error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create order'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const { getOrdersByUserId } = await import('@/lib/db/queries/orders')
    const result = await getOrdersByUserId(session.user.id, page, limit)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}