import { prisma } from '@/lib/db/prisma'
import { Payment, PaymentMethod, PaymentStatus, Prisma } from '@prisma/client'

export async function createPayment(data: {
  orderId: string
  paymentGateway: string
  gatewayTransactionId?: string
  paymentMethod?: PaymentMethod
  amount: number
  fee?: number
  expiredAt?: Date
}) {
  return prisma.payment.create({
    data: {
      ...data,
      status: 'PENDING',
    },
  })
}

export async function getPaymentByOrderId(orderId: string) {
  return prisma.payment.findUnique({
    where: { orderId },
    include: { order: true },
  })
}

export async function getPaymentByGatewayTransactionId(gatewayTransactionId: string) {
  return prisma.payment.findFirst({
    where: { gatewayTransactionId },
    include: { order: true },
  })
}

export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus,
  data?: {
    gatewayResponse?: any
    paidAt?: Date
    signatureVerified?: boolean
    callbackPayload?: any
  }
) {
  return prisma.payment.update({
    where: { id },
    data: { status, ...data },
  })
}

export async function createPaymentLog(data: {
  paymentId?: string
  eventType: string
  payload: any
  response?: any
  ipAddress?: string
  userAgent?: string
}) {
  return prisma.paymentLog.create({ data })
}

export async function getPaymentLogs(paymentId: string) {
  return prisma.paymentLog.findMany({
    where: { paymentId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getAllPaymentsForAdmin({
  page = 1,
  limit = 20,
  status,
  gateway,
  dateFrom,
  dateTo,
}: {
  page?: number
  limit?: number
  status?: PaymentStatus
  gateway?: string
  dateFrom?: Date
  dateTo?: Date
} = {}) {
  const where: Prisma.PaymentWhereInput = {}
  if (status) where.status = status
  if (gateway) where.paymentGateway = gateway
  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = dateFrom
    if (dateTo) where.createdAt.lte = dateTo
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: { order: { include: { user: true, product: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ])

  return { payments, total, page, limit, totalPages: Math.ceil(total / limit) }
}