import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getSupplierById, updateSupplier, deleteSupplier } from '@/lib/db/queries/suppliers'
import { validateInput, supplierSchema } from '@/lib/utils/validation'
import { createActivityLog } from '@/lib/db/queries/activity-logs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const supplier = await getSupplierById(id)
    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 })
    }

    return NextResponse.json({ supplier })
  } catch (error) {
    console.error('Admin get supplier error:', error)
    return NextResponse.json({ error: 'Failed to fetch supplier' }, { status: 500 })
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
    const validated = validateInput(supplierSchema, body)

    const supplier = await updateSupplier(id, validated)

    await createActivityLog({
      adminId: session.user.id,
      action: 'update_supplier',
      entityType: 'supplier',
      entityId: id,
      newData: { ...validated, apiKey: '[REDACTED]', apiSecret: '[REDACTED]', password: '[REDACTED]' },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ supplier })
  } catch (error) {
    console.error('Admin update supplier error:', error)
    const message = error instanceof Error ? error.message : 'Failed to update supplier'
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

    await deleteSupplier(id)

    await createActivityLog({
      adminId: session.user.id,
      action: 'delete_supplier',
      entityType: 'supplier',
      entityId: id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin delete supplier error:', error)
    return NextResponse.json({ error: 'Failed to delete supplier' }, { status: 500 })
  }
}