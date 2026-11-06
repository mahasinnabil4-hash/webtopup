import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/session'
import { getOrderStats } from '@/lib/db/queries/orders'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    await requireAdmin()

    const [orderStats, userCount, gameCount, productCount, pendingOrders] = await Promise.all([
      getOrderStats(),
      prisma.user.count(),
      prisma.game.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count({ where: { status: { in: ['PENDING', 'WAITING_PAYMENT', 'PROCESSING'] } } }),
    ])

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        product: { include: { game: true } },
      },
    })

    const revenueToday = await prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: {
        status: 'SUCCESS',
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    })

    const revenueMonth = await prisma.order.aggregate({
      _sum: { totalPrice: true },
      where: {
        status: 'SUCCESS',
        createdAt: { gte: new Date(new Date().setDate(1)) },
      },
    })

    return NextResponse.json({
      stats: {
        totalOrders: orderStats.totalOrders,
        totalRevenue: orderStats.totalRevenue,
        revenueToday: revenueToday._sum.totalPrice?.toNumber() || 0,
        revenueMonth: revenueMonth._sum.totalPrice?.toNumber() || 0,
        totalUsers: userCount,
        totalGames: gameCount,
        totalProducts: productCount,
        pendingOrders,
        statusCounts: orderStats.statusCounts,
      },
      recentOrders,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}