'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { StatsCards } from '@/components/admin/StatsCards'
import { DataTable } from '@/components/admin/DataTable'
import { Loader2 } from 'lucide-react'

interface StatCard {
  title: string
  value: string | number
  change?: string
  icon: React.ReactNode
  color: string
}

interface RecentOrder {
  id: string
  orderNumber: string
  user: { email: string; fullName?: string | null }
  product: { name: string; game: { name: string } }
  totalPrice: number
  status: string
  createdAt: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totalOrders: number
    totalRevenue: number
    revenueToday: number
    revenueMonth: number
    totalUsers: number
    totalGames: number
    totalProducts: number
    pendingOrders: number
    statusCounts: Record<string, number>
  } | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        const data = await response.json()
        if (response.ok) {
          setStats(data.stats)
          setRecentOrders(data.recentOrders)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  const statCards: StatCard[] = stats
    ? [
        {
          title: 'Total Pesanan',
          value: stats.totalOrders.toLocaleString('id-ID'),
          icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
          color: 'bg-blue-500/20 text-blue-400',
        },
        {
          title: 'Total Pendapatan',
          value: `Rp ${(stats.totalRevenue / 1000000).toFixed(1)}M`,
          icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          color: 'bg-green-500/20 text-green-400',
        },
        {
          title: 'Pendapatan Hari Ini',
          value: `Rp ${(stats.revenueToday / 1000).toFixed(0)}K`,
          icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
          color: 'bg-purple-500/20 text-purple-400',
        },
        {
          title: 'Pendapatan Bulan Ini',
          value: `Rp ${(stats.revenueMonth / 1000000).toFixed(1)}M`,
          icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
          color: 'bg-yellow-500/20 text-yellow-400',
        },
        {
          title: 'Total Pengguna',
          value: stats.totalUsers.toLocaleString('id-ID'),
          icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
          color: 'bg-pink-500/20 text-pink-400',
        },
        {
          title: 'Pesanan Pending',
          value: stats.pendingOrders.toLocaleString('id-ID'),
          icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          color: 'bg-orange-500/20 text-orange-400',
        },
      ]
    : []

  const orderColumns = [
    { key: 'orderNumber', header: 'No. Pesanan', className: 'font-mono text-sm' },
    { key: 'user', header: 'Pelanggan', render: (row: RecentOrder) => row.user.fullName || row.user.email },
    { key: 'product', header: 'Produk', render: (row: RecentOrder) => `${row.product.game.name} - ${row.product.name}` },
    { key: 'totalPrice', header: 'Total', render: (row: RecentOrder) => `Rp ${(row.totalPrice / 1000).toFixed(0)}K`, className: 'font-medium text-purple-400' },
    { key: 'status', header: 'Status', render: (row: RecentOrder) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
        {getStatusLabel(row.status)}
      </span>
    )},
    { key: 'createdAt', header: 'Tanggal', render: (row: RecentOrder) => formatDate(row.createdAt) },
  ]

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Dashboard</h1>
            <p className="text-slate-400">Ringkasan performa toko top-up game</p>
          </div>
        </div>

        <StatsCards stats={statCards} />

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-50">Pesanan Terbaru</h2>
            <a href="/admin/orders" className="text-sm text-purple-400 hover:text-purple-300">Lihat Semua →</a>
          </div>
          <DataTable
            data={recentOrders}
            columns={orderColumns}
            keyField="id"
            emptyMessage="Belum ada pesanan"
            rowLink={(row) => `/admin/orders/${row.id}`}
          />
        </div>
      </div>
    </AdminLayout>
  )
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Menunggu',
    WAITING_PAYMENT: 'Menunggu Bayar',
    PAID: 'Dibayar',
    PROCESSING: 'Diproses',
    SUCCESS: 'Berhasil',
    FAILED: 'Gagal',
    REFUNDED: 'Dikembalikan',
    CANCELLED: 'Dibatalkan',
  }
  return labels[status] || status
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-slate-900/50 text-slate-400 border border-slate-700',
    WAITING_PAYMENT: 'bg-yellow-900/30 text-yellow-400 border border-yellow-600',
    PAID: 'bg-blue-900/30 text-blue-400 border border-blue-600',
    PROCESSING: 'bg-purple-900/30 text-purple-400 border border-purple-600',
    SUCCESS: 'bg-green-900/30 text-green-400 border border-green-600',
    FAILED: 'bg-red-900/30 text-red-400 border border-red-600',
    REFUNDED: 'bg-orange-900/30 text-orange-400 border border-orange-600',
    CANCELLED: 'bg-slate-900/50 text-slate-500 border border-slate-700',
  }
  return colors[status] || 'bg-slate-900/50 text-slate-400'
}