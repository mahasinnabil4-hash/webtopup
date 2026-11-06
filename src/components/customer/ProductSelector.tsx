'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn, formatPrice } from '@/lib/utils/helpers'
import { formatNumber } from '@/lib/utils/format'

interface Product {
  id: string
  name: string
  sku: string
  denomination: number
  sellPrice: number | string
  costPrice?: number | string
  requiresZone: boolean
  zoneLabel: string
  game: {
    name: string
    slug: string
    logo: string
  }
}

interface ProductSelectorProps {
  products: Product[]
  selectedProductId?: string
  onSelect: (product: Product) => void
  onQuantityChange?: (quantity: number) => void
  quantity?: number
  className?: string
}

export function ProductSelector({
  products,
  selectedProductId,
  onSelect,
  onQuantityChange,
  quantity = 1,
  className,
}: ProductSelectorProps) {
  const [localQuantity, setLocalQuantity] = useState(quantity)

  const handleQuantityChange = (newQuantity: number) => {
    const clamped = Math.max(1, Math.min(100, newQuantity))
    setLocalQuantity(clamped)
    onQuantityChange?.(clamped)
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Tidak ada produk tersedia untuk game ini</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div role="group" aria-label="Pilih nominal top-up" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const isSelected = product.id === selectedProductId
          const price = typeof product.sellPrice === 'string' ? parseFloat(product.sellPrice) : product.sellPrice

          return (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelect(product)}
              className={cn(
                'relative rounded-xl border-2 p-4 transition-all text-left',
                isSelected
                  ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/50',
                'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-950'
              )}
              aria-pressed={isSelected}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-50">{product.name}</span>
                {isSelected && (
                  <svg className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="mt-2 text-lg font-bold text-purple-400">{formatPrice(price)}</div>
              {product.denomination && (
                <div className="mt-1 text-xs text-slate-400">
                  {formatNumber(product.denomination)} {product.sku.replace(/.*\d+/, '').trim() || 'Item'}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="flex items-center space-x-4">
        <label htmlFor="quantity" className="text-sm font-medium text-slate-300">
          Jumlah:
        </label>
        <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900/50">
          <button
            type="button"
            onClick={() => handleQuantityChange(localQuantity - 1)}
            className="px-4 py-2 text-slate-300 hover:text-slate-50 hover:bg-slate-800 transition-colors disabled:opacity-50"
            disabled={localQuantity <= 1}
            aria-label="Kurangi jumlah"
          >
            −
          </button>
          <input
            type="number"
            id="quantity"
            value={localQuantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
            min="1"
            max="100"
            className="w-20 text-center bg-transparent border-none focus:outline-none text-slate-50"
            aria-label="Jumlah pembelian"
          />
          <button
            type="button"
            onClick={() => handleQuantityChange(localQuantity + 1)}
            className="px-4 py-2 text-slate-300 hover:text-slate-50 hover:bg-slate-800 transition-colors disabled:opacity-50"
            disabled={localQuantity >= 100}
            aria-label="Tambah jumlah"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}