import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { validateInput, adminCreateSchema } from '@/lib/utils/validation'
import { hashPassword } from '@/lib/utils/crypto'
import { createActivityLog } from '@/lib/db/queries/activity-logs'

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || undefined
    const isActive = searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined

    const where: any = {}
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ]
    }
    if (isActive !== undefined) where.isActive = isActive

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({ users, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Admin get users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
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
    const validated = validateInput(adminCreateSchema, body)

    const existing = await prisma.admin.findUnique({ where: { email: validated.email } })
    if (existing) {
      return NextResponse.json({ error: 'Admin email already exists' }, { status: 400 })
    }

    const passwordHash = await hashPassword(validated.password)

    const admin = await prisma.admin.create({
      data: {
        email: validated.email,
        passwordHash,
        fullName: validated.fullName,
        role: validated.role,
      },
    })

    await createActivityLog({
      adminId: session.user.id,
      action: 'create_admin',
      entityType: 'admin',
      entityId: admin.id,
      newData: { email: validated.email, fullName: validated.fullName, role: validated.role },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ admin })
  } catch (error) {
    console.error('Admin create admin error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create admin'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}