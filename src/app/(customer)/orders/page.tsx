'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { OrderHistory } from '@/components/customer/OrderHistory'
import { Toaster } from '@/components/ui/toaster'
import { Loader2 } from 'lucide-react'

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== 'authenticated') return

    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/customer/orders?page=${page}&limit=10`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Gagal memuat pesanan')

        if (page === 1) {
          setOrders(data.orders)
        } else {
          setOrders((prev) => [...prev, ...data.orders])
        }
        setHasMore(data.page < data.totalPages)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat pesanan')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [page, status])

  const handleLoadMore = () => {
    setPage((prev) => prev + 1)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-slate-50">Silakan Login</h1>
          <p className="mt-2 text-slate-400">Anda harus login untuk melihat riwayat pesanan</p>
          <a href="/login" className="mt-6 inline-block px-6 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700">
            Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-50">Riwayat Pesanan</h1>
              <p className="mt-2 text-slate-400">Kelola dan lacak semua pesanan top-up Anda</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-600 text-red-300">
                {error}
              </div>
            )}

            <OrderHistory
              orders={orders}
              isLoading={isLoading && orders.length === 0}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          </div>
        </section>
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}