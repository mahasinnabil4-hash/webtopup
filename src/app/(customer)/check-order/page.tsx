'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { OrderStatus } from '@/components/customer/OrderStatus'
import { Toaster } from '@/components/ui/toaster'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Search, AlertCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'

const checkOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Nomor pesanan wajib diisi'),
  phone: z.string().optional(),
  email: z.string().email('Format email tidak valid').optional(),
}).refine((data) => data.phone || data.email, {
  message: 'Nomor telepon atau email wajib diisi',
  path: ['phone'],
})

export default function CheckOrderPage() {
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof checkOrderSchema>>({
    resolver: zodResolver(checkOrderSchema),
  })

  const onSubmit = async (data: z.infer<typeof checkOrderSchema>) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.append('orderNumber', data.orderNumber)
      if (data.phone) params.append('phone', data.phone)
      if (data.email) params.append('email', data.email)

      const response = await fetch(`/api/customer/check-order?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Pesanan tidak ditemukan')

      setOrder(result.order)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mencari pesanan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-12">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-slate-50">Cek Status Pesanan</h1>
              <p className="mt-2 text-slate-400">Masukkan nomor pesanan dan nomor telepon/email untuk melacak pesanan Anda</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <Input
                label="Nomor Pesanan *"
                placeholder="Contoh: TOPUP-ABC123"
                error={errors.orderNumber?.message}
                {...register('orderNumber')}
                autoComplete="off"
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nomor Telepon"
                  placeholder="08xxxxxxxxxx"
                  type="tel"
                  error={errors.phone?.message}
                  {...register('phone')}
                  autoComplete="tel"
                />
                <Input
                  label="Email"
                  placeholder="email@domain.com"
                  type="email"
                  error={errors.email?.message}
                  {...register('email')}
                  autoComplete="email"
                />
              </div>

              <p className="text-sm text-slate-500">Isi salah satu: nomor telepon ATAU email</p>

              {error && (
                <div className="p-4 rounded-lg bg-red-900/30 border border-red-600 flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" loading={isLoading} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Mencari...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Cek Pesanan
                  </>
                )}
              </Button>
            </form>

            {order && (
              <div className="mt-10">
                <OrderStatus status={order.status} order={order} />
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