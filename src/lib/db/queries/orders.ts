import { prisma } from '@/lib/db/prisma'
import { Order, OrderStatus, Prisma } from '@prisma/client'

export async function createOrder(data: {
  userId: string
  productId: string
  gameId: string
  userGameId: string
  userZoneId?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes?: string
}) {
  return prisma.order.create({
    data: {
      ...data,
      orderNumber: generateOrderNumber(),
    },
    include: {
      product: { include: { game: true } },
      game: true,
    },
  })
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `TOPUP-${timestamp}${random}`
}

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, fullName: true, phone: true } },
      product: { include: { game: true } },
      game: true,
      payment: true,
      supplierTransaction: { include: { supplier: true } },
    },
  })
}

export async function getOrderByOrderNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      user: { select: { id: true, email: true, fullName: true, phone: true } },
      product: { include: { game: true } },
      game: true,
      payment: true,
      supplierTransaction: { include: { supplier: true } },
    },
  })
}

export async function getOrdersByUserId(userId: string, page = 1, limit = 10) {
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        product: { include: { game: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where: { userId } }),
  ])

  return { orders, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getAllOrdersForAdmin({
  page = 1,
  limit = 20,
  search,
  status,
  gameId,
  userId,
  dateFrom,
  dateTo,
}: {
  page?: number
  limit?: number
  search?: string
  status?: OrderStatus
  gameId?: string
  userId?: string
  dateFrom?: Date
  dateTo?: Date
} = {}) {
  const where: Prisma.OrderWhereInput = {}
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { userGameId: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { user: { fullName: { contains: search, mode: 'insensitive' } } },
    ]
  }
  if (status) where.status = status
  if (gameId) where.gameId = gameId
  if (userId) where.userId = userId
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = dateFrom
    if (dateTo) where.createdAt.lte = dateTo
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, fullName: true, phone: true } },
        product: { include: { game: true } },
        game: true,
        payment: true,
        supplierTransaction: { include: { supplier: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])

  return { orders, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  data?: { supplierOrderId?: string; processedAt?: Date; completedAt?: Date; failedReason?: string }
) {
  return prisma.order.update({
    where: { id },
    data: { status, ...data },
  })
}

export async function getOrderStats() {
  const [totalOrders, totalRevenue, statusCounts] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: { status: 'SUCCESS' },
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: true,
    }),
  ])

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.totalPrice?.toNumber() || 0,
    statusCounts: statusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count
      return acc
    }, {} as Record<OrderStatus, number>),
  }
}

export async function updatePaymentStatus(
  orderId: string,
  status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'CANCELLED',
  data?: { paidAt?: Date; supplierOrderId?: string; failedReason?: string }
) {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(data?.paidAt && { processedAt: data.paidAt }),
      ...(data?.supplierOrderId && { supplierOrderId: data.supplierOrderId }),
      ...(data?.failedReason && { failedReason: data.failedReason }),
    },
  })
}