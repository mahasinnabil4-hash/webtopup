import { prisma } from '@/lib/db/prisma'
import { Product, Prisma } from '@prisma/client'

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      game: true,
      supplierMappings: {
        include: { supplier: true },
      },
    },
  })
}

export async function getProductBySku(sku: string) {
  return prisma.product.findUnique({
    where: { sku },
    include: { game: true },
  })
}

export async function getProductsByGameId(gameId: string) {
  return prisma.product.findMany({
    where: { gameId, isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getAllProductsForAdmin({
  page = 1,
  limit = 20,
  search,
  gameId,
  isActive,
}: {
  page?: number
  limit?: number
  search?: string
  gameId?: string
  isActive?: boolean
} = {}) {
  const where: Prisma.ProductWhereInput = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (gameId) where.gameId = gameId
  if (isActive !== undefined) where.isActive = isActive

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        game: { select: { id: true, name: true, slug: true } },
        supplierMappings: { include: { supplier: true } },
      },
      orderBy: [{ game: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return { products, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function createProduct(data: {
  gameId: string
  name: string
  sku: string
  denomination: number
  costPrice: number
  sellPrice: number
  margin: number
  isActive?: boolean
  requiresZone?: boolean
  zoneLabel?: string
  sortOrder?: number
}) {
  return prisma.product.create({ data })
}

export async function updateProduct(id: string, data: Partial<{
  gameId: string
  name: string
  sku: string
  denomination: number
  costPrice: number
  sellPrice: number
  margin: number
  isActive: boolean
  requiresZone: boolean
  zoneLabel: string | null
  sortOrder: number
}>) {
  return prisma.product.update({ where: { id }, data })
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } })
}

export async function bulkUpdateProductPrices(
  productIds: string[],
  margin: number
) {
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, costPrice: true },
  })

  return prisma.$transaction(
    products.map((product) =>
      prisma.product.update({
        where: { id: product.id },
        data: {
          margin,
          sellPrice: product.costPrice.mul(1 + margin / 100),
        },
      })
    )
  )
}