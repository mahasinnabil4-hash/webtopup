'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CreditCard, AlertCircle, CheckCircle } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/toaster'
import { formatPrice } from '@/lib/utils/format'
import { cn } from '@/lib/utils/helpers'

export function CheckoutContent({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderData, setOrderData] = useState<any>(null)
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initCheckout = async () => {
      const productId = searchParams.get('productId')
      const userGameId = searchParams.get('userGameId')
      const userZoneId = searchParams.get('userZoneId')
      const quantity = searchParams.get('quantity')

      if (!productId || !userGameId) {
        router.push('/games')
        return
      }

      try {
        const response = await fetch(`/api/customer/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, userGameId, userZoneId, quantity: parseInt(quantity || '1') }),
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Gagal membuat pesanan')

        setOrderData(data.order)
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat checkout')
        setIsLoading(false)
      }
    }

    initCheckout()
  }, [router, searchParams])

  const handleCreatePayment = async () => {
    if (!orderData || !selectedMethod) return

    setIsCreatingPayment(true)
    setError(null)

    try {
      const response = await fetch(`/api/customer/payment/create?orderId=${orderData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: selectedMethod }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Gagal membuat pembayaran')

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        router.push(`/payment/${orderData.id}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat pembayaran')
      setIsCreatingPayment(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (error && !orderData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center px-4">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-slate-50">Gagal Memuat Checkout</h1>
          <p className="mt-2 text-slate-400">{error}</p>
          <button onClick={() => router.push('/games')} className="mt-6 px-6 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700">
            Kembali ke Game
          </button>
        </div>
      </div>
    )
  }

  if (!orderData) return null

  const price = orderData.unitPrice
  const total = orderData.totalPrice

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-50">Konfirmasi Pesanan</h1>
              <p className="mt-2 text-slate-400">No. Pesanan: <span className="font-mono text-purple-400">{orderData.orderNumber}</span></p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Detail Pesanan</span>
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Game</span>
                    <span className="font-medium text-slate-50">{orderData.game.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Produk</span>
                    <span className="font-medium text-slate-50">{orderData.product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">User ID</span>
                    <span className="font-medium text-slate-50">{orderData.userGameId}</span>
                  </div>
                  {orderData.userZoneId && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Zone ID</span>
                      <span className="font-medium text-slate-50">{orderData.userZoneId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jumlah</span>
                    <span className="font-medium text-slate-50">× {orderData.quantity}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-700 pt-4">
                    <span className="text-slate-400">Total</span>
                    <span className="font-bold text-xl text-purple-400">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <h2 className="text-lg font-semibold text-slate-50 mb-4 flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                  <span>Metode Pembayaran</span>
                </h2>
                <div className="space-y-3" role="radiogroup" aria-label="Pilih metode pembayaran">
                  {[
                    { id: 'qris', name: 'QRIS', desc: 'Scan QR Code via aplikasi e-wallet/banking' },
                    { id: 'gopay', name: 'GoPay', desc: 'Bayar via aplikasi Gojek' },
                    { id: 'dana', name: 'DANA', desc: 'Bayar via aplikasi DANA' },
                    { id: 'shopeepay', name: 'ShopeePay', desc: 'Bayar via aplikasi Shopee' },
                    { id: 'va', name: 'Virtual Account', desc: 'Transfer via BCA, BNI, BRI, Mandiri, dll' },
                    { id: 'alfamart', name: 'Alfamart', desc: 'Bayar di kasir Alfamart terdekat' },
                    { id: 'indomaret', name: 'Indomaret', desc: 'Bayar di kasir Indomaret terdekat' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethod(method.id)}
                      className={cn(
                        'w-full p-4 rounded-lg border-2 text-left transition-all',
                        selectedMethod === method.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      )}
                      role="radio"
                      aria-checked={selectedMethod === method.id}
                    >
                      <div className="font-medium text-slate-50">{method.name}</div>
                      <div className="text-sm text-slate-400">{method.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 rounded-lg bg-red-900/30 border border-red-600 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="text-red-300">{error}</p>
              </div>
            )}

            <button
              onClick={handleCreatePayment}
              disabled={!selectedMethod || isCreatingPayment}
              className={cn(
                'mt-8 w-full py-4 px-6 rounded-lg text-lg font-medium transition-colors',
                selectedMethod && !isCreatingPayment
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              )}
            >
              {isCreatingPayment ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Memproses Pembayaran...
                </span>
              ) : (
                `Bayar Sekarang - ${formatPrice(total)}`
              )}
            </button>

            <p className="mt-4 text-center text-sm text-slate-500">
              Dengan membayar, Anda menyetujui{' '}
              <a href="/terms" className="underline hover:text-purple-400">Syarat & Ketentuan</a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}