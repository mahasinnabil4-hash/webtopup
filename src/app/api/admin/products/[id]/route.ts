import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getProductById, updateProduct, deleteProduct } from '@/lib/db/queries/products'
import { validateInput, productSchema } from '@/lib/utils/validation'
import { createActivityLog } from '@/lib/db/queries/activity-logs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const product = await getProductById(id)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Admin get product error:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await requireAdmin()
    const { id } = await params

    const body = await request.json()
    const validated = validateInput(productSchema, body)

    const product = await updateProduct(id, validated)

    await createActivityLog({
      adminId: session.user.id,
      action: 'update_product',
      entityType: 'product',
      entityId: id,
      newData: validated,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Admin update product error:', error)
    const message = error instanceof Error ? error.message : 'Failed to update product'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await requireAdmin()
    const { id } = await params

    await deleteProduct(id)

    await createActivityLog({
      adminId: session.user.id,
      action: 'delete_product',
      entityType: 'product',
      entityId: id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin delete product error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}