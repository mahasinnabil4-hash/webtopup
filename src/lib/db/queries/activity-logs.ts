import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'

export interface ActivityLogInput {
  userId?: string
  adminId?: string
  action: string
  entityType: string
  entityId?: string
  oldData?: any
  newData?: any
  ipAddress?: string
  userAgent?: string
}

export async function createActivityLog(data: ActivityLogInput) {
  return prisma.activityLog.create({ data })
}

export async function getActivityLogs({
  page = 1,
  limit = 50,
  userId,
  adminId,
  action,
  entityType,
  entityId,
  dateFrom,
  dateTo,
}: {
  page?: number
  limit?: number
  userId?: string
  adminId?: string
  action?: string
  entityType?: string
  entityId?: string
  dateFrom?: Date
  dateTo?: Date
} = {}) {
  const where: Prisma.ActivityLogWhereInput = {}
  if (userId) where.userId = userId
  if (adminId) where.adminId = adminId
  if (action) where.action = action
  if (entityType) where.entityType = entityType
  if (entityId) where.entityId = entityId
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = dateFrom
    if (dateTo) where.createdAt.lte = dateTo
  }

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        admin: { select: { id: true, email: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.activityLog.count({ where }),
  ])

  return { logs, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getUserActivityLogs(userId: string, limit = 20) {
  return prisma.activityLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}