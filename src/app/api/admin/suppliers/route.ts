import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getAllSuppliersForAdmin, createSupplier } from '@/lib/db/queries/suppliers'
import { validateInput, supplierSchema } from '@/lib/utils/validation'
import { createActivityLog } from '@/lib/db/queries/activity-logs'

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') as any

    const result = await getAllSuppliersForAdmin({ page, limit, search, status })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Admin get suppliers error:', error)
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 })
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
    const validated = validateInput(supplierSchema, body)

    const supplier = await createSupplier(validated)

    await createActivityLog({
      adminId: session.user.id,
      action: 'create_supplier',
      entityType: 'supplier',
      entityId: supplier.id,
      newData: { ...validated, apiKey: '[REDACTED]', apiSecret: '[REDACTED]', password: '[REDACTED]' },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ supplier })
  } catch (error) {
    console.error('Admin create supplier error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create supplier'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}