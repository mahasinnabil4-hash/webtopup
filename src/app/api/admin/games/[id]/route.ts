import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getGameById, updateGame, deleteGame } from '@/lib/db/queries/games'
import { validateInput, gameSchema } from '@/lib/utils/validation'
import { createActivityLog } from '@/lib/db/queries/activity-logs'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const game = await getGameById(id)
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    return NextResponse.json({ game })
  } catch (error) {
    console.error('Admin get game error:', error)
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 })
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
    const validated = validateInput(gameSchema, body)

    const game = await updateGame(id, validated)

    await createActivityLog({
      adminId: session.user.id,
      action: 'update_game',
      entityType: 'game',
      entityId: id,
      newData: validated,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ game })
  } catch (error) {
    console.error('Admin update game error:', error)
    const message = error instanceof Error ? error.message : 'Failed to update game'
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

    await deleteGame(id)

    await createActivityLog({
      adminId: session.user.id,
      action: 'delete_game',
      entityType: 'game',
      entityId: id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin delete game error:', error)
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 })
  }
}