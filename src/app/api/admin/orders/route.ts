import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getAllOrdersForAdmin, updateOrderStatus, getOrderById } from '@/lib/db/queries/orders'
import { createActivityLog } from '@/lib/db/queries/activity-logs'

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || undefined
    const status = searchParams.get('status') as any
    const gameId = searchParams.get('gameId') || undefined
    const userId = searchParams.get('userId') || undefined
    const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined

    const result = await getAllOrdersForAdmin({
      page,
      limit,
      search,
      status,
      gameId,
      userId,
      dateFrom,
      dateTo,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Admin get orders error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await requireAdmin()

    const body = await request.json()
    const { id, status, supplierOrderId, failedReason } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 })
    }

    const order = await getOrderById(id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const updated = await updateOrderStatus(id, status, {
      supplierOrderId,
      failedReason,
      processedAt: ['PROCESSING', 'SUCCESS', 'FAILED'].includes(status) ? new Date() : undefined,
      completedAt: status === 'SUCCESS' ? new Date() : undefined,
    })

    await createActivityLog({
      adminId: session.user.id,
      action: 'update_order_status',
      entityType: 'order',
      entityId: id,
      oldData: { status: order.status },
      newData: { status, supplierOrderId, failedReason },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ order: updated })
  } catch (error) {
    console.error('Admin update order error:', error)
    const message = error instanceof Error ? error.message : 'Failed to update order'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}