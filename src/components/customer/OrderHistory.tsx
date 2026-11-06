'use client'

import Link from 'next/link'
import { formatDateTime, formatPrice, formatRelativeTime } from '@/lib/utils/helpers'
import { Badge } from '@/components/ui/badge'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/constants'

interface OrderHistoryProps {
  orders: Array<{
    id: string
    orderNumber: string
    status: string
    createdAt: string
    paidAt?: string | null
    totalPrice: number | string
    quantity: number
    game: { name: string; logo: string; slug: string }
    product: { name: string }
    payment?: { paymentMethod?: string | null } | null
  }>
  isLoading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
}

export function OrderHistory({ orders, isLoading, onLoadMore, hasMore }: OrderHistoryProps) {
  if (isLoading && orders.length === 0) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Memuat riwayat pesanan">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="h-4 w-1/4 bg-slate-800 rounded mb-4" />
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="h-4 w-full bg-slate-800 rounded" />
              <div className="h-4 w-full bg-slate-800 rounded" />
              <div className="h-4 w-full bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="mx-auto h-16 w-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-slate-400">Belum ada pesanan</h3>
        <p className="mt-2 text-slate-500">Mulai top-up game favorit Anda sekarang</p>
        <Link href="/games" className="mt-6 inline-block">
          <button className="px-6 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
            Beli Sekarang
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4" role="list" aria-label="Riwayat pesanan">
      {orders.map((order) => (
        <article
          key={order.id}
          className="relative rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700"
          role="listitem"
        >
          <Link
            href={`/orders/${order.id}`}
            className="block"
            aria-label={`Lihat detail pesanan ${order.orderNumber}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
                  {order.game.logo ? (
                    <img
                      src={order.game.logo}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <svg className="h-8 w-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-50">{order.game.name}</p>
                  <p className="text-sm text-slate-400">{order.product.name}</p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end space-y-2 sm:space-y-0 sm:space-x-4">
                <Badge variant="outline" className={ORDER_STATUS_COLORS[order.status]}>
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </Badge>
                <div className="text-right">
                  <p className="font-bold text-purple-400">{formatPrice(order.totalPrice)}</p>
                  <p className="text-xs text-slate-500">{formatRelativeTime(order.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-4">
              <div className="flex items-center space-x-4 text-sm text-slate-400">
                <span>User ID: <span className="text-slate-300 font-mono">{order.id.slice(-8)}</span></span>
                {order.payment?.paymentMethod && (
                  <span>Bayar: <span className="text-slate-300">{order.payment.paymentMethod}</span></span>
                )}
              </div>
              <span className="text-xs text-slate-500">Klik untuk detail →</span>
            </div>
          </Link>
        </article>
      ))}

      {hasMore && onLoadMore && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-3 text-sm font-medium text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800 hover:text-slate-50 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Memuat...' : 'Muat Lebih Banyak'}
          </button>
        </div>
      )}
    </div>
  )
}