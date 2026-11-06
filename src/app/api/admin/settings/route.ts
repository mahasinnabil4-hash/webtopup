import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getAllSettings, setSetting, deleteSetting, SETTING_KEYS } from '@/lib/db/queries/settings'
import { createActivityLog } from '@/lib/db/queries/activity-logs'

export async function GET() {
  try {
    await requireAdmin()
    const settings = await getAllSettings()
    return NextResponse.json({ settings, keys: SETTING_KEYS })
  } catch (error) {
    console.error('Admin get settings error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
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
    const { key, value, description, isPublic } = body

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    const setting = await setSetting(key, value, description, isPublic)

    await createActivityLog({
      adminId: session.user.id,
      action: 'update_setting',
      entityType: 'setting',
      entityId: key,
      newData: { key, value, description, isPublic },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ setting })
  } catch (error) {
    console.error('Admin update setting error:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 })
    }

    await deleteSetting(key)

    await createActivityLog({
      adminId: session.user.id,
      action: 'delete_setting',
      entityType: 'setting',
      entityId: key,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin delete setting error:', error)
    return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 })
  }
}