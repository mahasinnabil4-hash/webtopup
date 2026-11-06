'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { OrderStatus } from '@/components/customer/OrderStatus'
import { Toaster } from '@/components/ui/toaster'
import { formatPrice } from '@/lib/utils/format'
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'

export default function PaymentPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/customer/orders/${orderId}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Gagal memuat pesanan')
        setOrder(data.order)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat pesanan')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
    const interval = setInterval(fetchOrder, 10000)
    return () => clearInterval(interval)
  }, [orderId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center px-4">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-slate-50">Pesanan Tidak Ditemukan</h1>
          <p className="mt-2 text-slate-400">{error || 'Pesanan tidak ditemukan'}</p>
          <a href="/games" className="mt-6 inline-block px-6 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700">
            Kembali ke Game
          </a>
        </div>
      </div>
    )
  }

  const isPending = ['PENDING', 'WAITING_PAYMENT'].includes(order.status)
  const isPaid = order.status === 'PAID'
  const isProcessing = order.status === 'PROCESSING'
  const isSuccess = order.status === 'SUCCESS'
  const isFailed = ['FAILED', 'CANCELLED'].includes(order.status)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-50">Pembayaran Pesanan</h1>
              <p className="mt-2 text-slate-400">No. Pesanan: <span className="font-mono text-purple-400">{order.orderNumber}</span></p>
            </div>

            <OrderStatus status={order.status} order={order} />

            {isPending && order.payment && (
              <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                  <span>Instruksi Pembayaran</span>
                </h2>
                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-4">
                    <p className="text-sm text-slate-400">Total Tagihan</p>
                    <p className="mt-1 font-bold text-2xl text-purple-400">{formatPrice(order.totalPrice)}</p>
                  </div>
                  {order.payment.gatewayResponse?.va_numbers && (
                    <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-4">
                      <p className="text-sm text-slate-400 mb-2">Virtual Account Numbers</p>
                      <div className="space-y-2">
                        {order.payment.gatewayResponse.va_numbers.map((va: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded bg-slate-800">
                            <span className="font-medium text-slate-50">{va.bank}</span>
                            <div className="flex items-center space-x-2">
                              <code className="font-mono text-lg text-purple-400 bg-slate-900 px-3 py-1 rounded">{va.va_number}</code>
                              <button className="px-3 py-1 text-xs text-slate-400 hover:text-slate-50 bg-slate-700 rounded" onClick={() => navigator.clipboard.writeText(va.va_number)}>Salin</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {order.payment.gatewayResponse?.qr_string && (
                    <div className="rounded-lg border border-slate-700 bg-slate-900/30 p-4 text-center">
                      <p className="text-sm text-slate-400 mb-2">QRIS / QR Code</p>
                      <div className="inline-block p-4 bg-white rounded">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(order.payment.gatewayResponse.qr_string)}`} alt="QR Code" className="mx-auto" />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">Scan menggunakan aplikasi e-wallet/banking Anda</p>
                    </div>
                  )}
                  <div className="rounded-lg border border-yellow-600 bg-yellow-900/30 p-4">
                    <p className="text-sm text-yellow-300">
                      <strong>Penting:</strong> Pembayaran harus selesai dalam 24 jam. Pesanan akan otomatis dibatalkan jika kedaluwarsa.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isSuccess && (
              <div className="mt-8 text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold text-green-400">Top Up Berhasil!</h2>
                <p className="mt-2 text-slate-400">Item telah dikirim ke akun game Anda. Silakan cek di game.</p>
              </div>
            )}

            {isFailed && (
              <div className="mt-8 text-center">
                <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-red-400">Pesanan Gagal</h2>
                <p className="mt-2 text-slate-400">{order.failedReason || 'Terjadi kesalahan saat memproses pesanan'}</p>
                <p className="mt-2 text-slate-500 text-sm">Silakan hubungi support atau buat pesanan baru</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}