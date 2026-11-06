import { prisma } from '@/lib/db/prisma'
import { Game, Product, Prisma } from '@prisma/client'

export async function getActiveGames(): Promise<(Game & { products: Product[] })[]> {
  return prisma.game.findMany({
    where: { isActive: true },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getGameBySlug(slug: string) {
  return prisma.game.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })
}

export async function getGameById(id: string) {
  return prisma.game.findUnique({
    where: { id },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
      supplierMappings: {
        include: { supplier: true },
      },
    },
  })
}

export async function getAllGamesForAdmin({
  page = 1,
  limit = 20,
  search,
  isActive,
}: {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
} = {}) {
  const where: Prisma.GameWhereInput = {}
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (isActive !== undefined) where.isActive = isActive

  const [games, total] = await Promise.all([
    prisma.game.findMany({
      where,
      include: {
        _count: { select: { products: true } },
        supplierMappings: { include: { supplier: true } },
      },
      orderBy: { sortOrder: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.game.count({ where }),
  ])

  return { games, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function createGame(data: {
  name: string
  slug: string
  logo: string
  banner?: string | null
  description?: string | null
  isActive?: boolean
  sortOrder?: number
}) {
  return prisma.game.create({ data })
}

export async function updateGame(id: string, data: Partial<{
  name: string
  slug: string
  logo: string
  banner: string | null
  description: string | null
  isActive: boolean
  sortOrder: number
}>) {
  return prisma.game.update({ where: { id }, data })
}

export async function deleteGame(id: string) {
  return prisma.game.delete({ where: { id } })
}