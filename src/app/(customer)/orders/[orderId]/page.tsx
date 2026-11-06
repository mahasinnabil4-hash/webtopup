'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { OrderStatus } from '@/components/customer/OrderStatus'
import { Toaster } from '@/components/ui/toaster'
import { Loader2, AlertCircle } from 'lucide-react'
import { notFound } from 'next/navigation'

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = useParams() as { orderId: string }
  const { data: session, status } = useSession()
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/customer/orders/${orderId}`)
        const data = await response.json()
        if (!response.ok) {
          if (response.status === 404) notFound()
          throw new Error(data.error || 'Gagal memuat pesanan')
        }
        setOrder(data.order)
      } catch (err) {
        if (err instanceof Error && err.message !== 'NEXT_NOT_FOUND') {
          setError(err instanceof Error ? err.message : 'Gagal memuat pesanan')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
    const interval = setInterval(fetchOrder, 15000)
    return () => clearInterval(interval)
  }, [orderId])

  if (status === 'loading' || isLoading) {
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
          <a href={`/login?redirect=/orders/${orderId}`} className="mt-6 inline-block px-6 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700">
            Login
          </a>
        </div>
      </div>
    )
  }

  if (error || !order) {
    notFound()
  }

  if (order.userId !== session?.user?.id) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-50">Detail Pesanan</h1>
                <p className="mt-2 text-slate-400">No. Pesanan: <span className="font-mono text-purple-400">{order.orderNumber}</span></p>
              </div>
            </div>

            <OrderStatus status={order.status} order={order} />
          </div>
        </section>
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}