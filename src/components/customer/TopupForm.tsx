'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils/helpers'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/format'
import { Loader2 } from 'lucide-react'

const topupSchema = z.object({
  userGameId: z.string().min(1, 'User ID wajib diisi'),
  userZoneId: z.string().optional(),
  quantity: z.number().int().min(1).max(100).default(1),
})

export interface TopupFormProps {
  product: {
    id: string
    name: string
    sellPrice: number | string
    requiresZone: boolean
    zoneLabel: string
    game: {
      name: string
      slug: string
      logo: string
    }
  }
  quantity: number
  onSubmit: (data: z.infer<typeof topupSchema>) => Promise<void>
  isLoading?: boolean
  className?: string
}

export function TopupForm({ product, quantity, onSubmit, isLoading, className }: TopupFormProps) {
  const price = typeof product.sellPrice === 'string' ? parseFloat(product.sellPrice) : product.sellPrice
  const totalPrice = price * quantity

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<z.infer<typeof topupSchema>>({
    resolver: zodResolver(topupSchema),
    defaultValues: {
      userGameId: '',
      userZoneId: '',
      quantity,
    },
  })

  const watchedQuantity = watch('quantity', quantity)

  const handleQuantityChange = (newQuantity: number) => {
    const clamped = Math.max(1, Math.min(100, newQuantity))
    setValue('quantity', clamped, { shouldValidate: true })
  }

return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6', className)} noValidate>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <h3 className="mb-4 flex items-center space-x-2 text-lg font-semibold text-slate-50">
            <span className="text-purple-500">🎮</span>
            <span>{product.game.name} - {product.name}</span>
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="User ID *"
              placeholder="Masukkan User ID game Anda"
              error={errors.userGameId?.message}
              {...register('userGameId')}
              autoComplete="off"
              required
            />

            {product.requiresZone && (
              <Input
                label={`${product.zoneLabel} *`}
                placeholder={`Masukkan ${product.zoneLabel} Anda`}
                error={errors.userZoneId?.message}
                {...register('userZoneId')}
                autoComplete="off"
                required
              />
            )}
          </div>

          <div className="flex items-center space-x-4">
            <label htmlFor="quantity" className="text-sm font-medium text-slate-300">
              Jumlah:
            </label>
            <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900/50">
              <button
                type="button"
                onClick={() => handleQuantityChange(watchedQuantity - 1)}
                className="px-4 py-2 text-slate-300 hover:text-slate-50 hover:bg-slate-800 transition-colors disabled:opacity-50"
                disabled={watchedQuantity <= 1}
                aria-label="Kurangi jumlah"
              >
                −
              </button>
              <input
                type="number"
                id="quantity"
                value={watchedQuantity}
                min="1"
                max="100"
                className="w-20 text-center bg-transparent border-none focus:outline-none text-slate-50"
                aria-label="Jumlah pembelian"
                {...register('quantity', { 
                  valueAsNumber: true,
                  onChange: (e) => handleQuantityChange(parseInt(e.target.value) || 1)
                })}
              />
              <button
                type="button"
                onClick={() => handleQuantityChange(watchedQuantity + 1)}
                className="px-4 py-2 text-slate-300 hover:text-slate-50 hover:bg-slate-800 transition-colors disabled:opacity-50"
                disabled={watchedQuantity >= 100}
                aria-label="Tambah jumlah"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-700 bg-slate-900/30 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Harga satuan</span>
            <span className="font-medium text-slate-50">{formatPrice(price)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Jumlah</span>
            <span className="font-medium text-slate-50">× {watchedQuantity}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-lg font-bold text-purple-400 border-t border-slate-700 pt-3">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>

        <Button type="submit" className="w-full" size="xl" loading={isLoading} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Memproses...
            </>
          ) : (
            `Lanjut ke Pembayaran - ${formatPrice(totalPrice)}`
          )}
        </Button>

        <p className="text-center text-xs text-slate-500">
          Dengan melanjutkan, Anda menyetujui{' '}
          <a href="/terms" className="underline hover:text-purple-400">Syarat & Ketentuan</a>{' '}
          dan{' '}
          <a href="/privacy" className="underline hover:text-purple-400">Kebijakan Privasi</a>
        </p>
      </form>
    </>
  )
}