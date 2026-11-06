import { prisma } from '@/lib/db/prisma'
import { Supplier, SupplierStatus, Prisma } from '@prisma/client'

export async function getActiveSuppliers() {
  return prisma.supplier.findMany({
    where: { status: 'ACTIVE' },
    include: {
      gameMappings: { include: { game: true } },
      productMappings: { include: { product: true } },
    },
  })
}

export async function getSupplierById(id: string) {
  return prisma.supplier.findUnique({
    where: { id },
    include: {
      gameMappings: { include: { game: true } },
      productMappings: { include: { product: true } },
    },
  })
}

export async function getSupplierByCode(code: string) {
  return prisma.supplier.findUnique({
    where: { code },
    include: {
      gameMappings: { include: { game: true } },
      productMappings: { include: { product: true } },
    },
  })
}

export async function getAllSuppliersForAdmin({
  page = 1,
  limit = 20,
  search,
  status,
}: {
  page?: number
  limit?: number
  search?: string
  status?: SupplierStatus
} = {}) {
  const where: Prisma.SupplierWhereInput = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status) where.status = status

  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      include: {
        _count: { select: { gameMappings: true, productMappings: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supplier.count({ where }),
  ])

  return { suppliers, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function createSupplier(data: {
  name: string
  code: string
  baseUrl?: string | null
  apiKey?: string | null
  apiSecret?: string | null
  username?: string | null
  password?: string | null
  callbackUrl?: string | null
  status?: SupplierStatus
  config?: any
  isManual?: boolean
}) {
  return prisma.supplier.create({ data })
}

export async function updateSupplier(id: string, data: Partial<{
  name: string
  code: string
  baseUrl: string | null
  apiKey: string | null
  apiSecret: string | null
  username: string | null
  password: string | null
  callbackUrl: string | null
  status: SupplierStatus
  config: any
  isManual: boolean
}>) {
  return prisma.supplier.update({ where: { id }, data })
}

export async function deleteSupplier(id: string) {
  return prisma.supplier.delete({ where: { id } })
}

export async function createSupplierGameMapping(data: {
  supplierId: string
  gameId: string
  supplierGameCode: string
  isActive?: boolean
}) {
  return prisma.supplierGameMapping.create({ data })
}

export async function updateSupplierGameMapping(id: string, data: {
  supplierGameCode?: string
  isActive?: boolean
}) {
  return prisma.supplierGameMapping.update({ where: { id }, data })
}

export async function deleteSupplierGameMapping(id: string) {
  return prisma.supplierGameMapping.delete({ where: { id } })
}

export async function createSupplierProductMapping(data: {
  supplierId: string
  productId: string
  supplierProductCode: string
  supplierPrice: number
  isActive?: boolean
}) {
  return prisma.supplierProductMapping.create({ data })
}

export async function updateSupplierProductMapping(id: string, data: {
  supplierProductCode?: string
  supplierPrice?: number
  isActive?: boolean
}) {
  return prisma.supplierProductMapping.update({ where: { id }, data })
}

export async function deleteSupplierProductMapping(id: string) {
  return prisma.supplierProductMapping.delete({ where: { id } })
}

export async function createSupplierTransaction(data: {
  orderId: string
  supplierId: string
  supplierOrderId?: string
  requestPayload: any
  responsePayload?: any
  status?: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
}) {
  return prisma.supplierTransaction.create({ data })
}

export async function getSupplierTransactionByOrderId(orderId: string) {
  return prisma.supplierTransaction.findUnique({
    where: { orderId },
    include: { supplier: true, order: true },
  })
}

export async function getSupplierProductMapping(supplierId: string, productId: string) {
  return prisma.supplierProductMapping.findFirst({
    where: { supplierId, productId },
  })
}

export async function updateSupplierTransaction(id: string, data: {
  supplierOrderId?: string
  responsePayload?: any
  status?: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
  retryCount?: number
  lastAttemptAt?: Date
  errorMessage?: string
}) {
  return prisma.supplierTransaction.update({ where: { id }, data })
}

export async function getSupplierTransactionsForAdmin({
  page = 1,
  limit = 20,
  status,
  supplierId,
}: {
  page?: number
  limit?: number
  status?: string
  supplierId?: string
} = {}) {
  const where: Prisma.SupplierTransactionWhereInput = {}
  if (status) where.status = status as any
  if (supplierId) where.supplierId = supplierId

  const [transactions, total] = await Promise.all([
    prisma.supplierTransaction.findMany({
      where,
      include: { supplier: true, order: { include: { user: true, product: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supplierTransaction.count({ where }),
  ])

  return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) }
}