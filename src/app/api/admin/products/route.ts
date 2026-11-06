import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getAllProductsForAdmin, createProduct, updateProduct, deleteProduct } from '@/lib/db/queries/products'
import { validateInput, productSchema } from '@/lib/utils/validation'
import { createActivityLog } from '@/lib/db/queries/activity-logs'

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || undefined
    const gameId = searchParams.get('gameId') || undefined
    const isActive = searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined

    const result = await getAllProductsForAdmin({ page, limit, search, gameId, isActive })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Admin get products error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await requireAdmin()

    const body = await request.json()
    const validated = validateInput(productSchema, body)

    const product = await createProduct(validated)

    await createActivityLog({
      adminId: session.user.id,
      action: 'create_product',
      entityType: 'product',
      entityId: product.id,
      newData: validated,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Admin create product error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create product'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}