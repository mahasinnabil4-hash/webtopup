'use client'

import { cn, formatDateTime, formatRelativeTime } from '@/lib/utils/helpers'
import { formatPrice } from '@/lib/utils/format'
import {
  Clock,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  Loader2,
} from 'lucide-react'

const STATUS_CONFIG = {
  PENDING: { label: 'Menunggu', color: 'text-slate-400', bg: 'bg-slate-900/50', icon: Clock },
  WAITING_PAYMENT: { label: 'Menunggu Pembayaran', color: 'text-yellow-400', bg: 'bg-yellow-900/30', icon: CreditCard },
  PAID: { label: 'Dibayar', color: 'text-blue-400', bg: 'bg-blue-900/30', icon: CheckCircle },
  PROCESSING: { label: 'Diproses', color: 'text-purple-400', bg: 'bg-purple-900/30', icon: Loader2 },
  SUCCESS: { label: 'Berhasil', color: 'text-green-400', bg: 'bg-green-900/30', icon: CheckCircle },
  FAILED: { label: 'Gagal', color: 'text-red-400', bg: 'bg-red-900/30', icon: XCircle },
  REFUNDED: { label: 'Dikembalikan', color: 'text-orange-400', bg: 'bg-orange-900/30', icon: RotateCcw },
  CANCELLED: { label: 'Dibatalkan', color: 'text-slate-400', bg: 'bg-slate-900/50', icon: XCircle },
} as const

type OrderStatus = keyof typeof STATUS_CONFIG

interface OrderStatusProps {
  status: OrderStatus
  order: {
    id: string
    orderNumber: string
    createdAt: string
    updatedAt: string
    paidAt?: string | null
    completedAt?: string | null
    failedReason?: string | null
    game: { name: string; logo: string }
    product: { name: string; denomination: number }
    userGameId: string
    userZoneId?: string | null
    quantity: number
    totalPrice: number | string
    payment?: {
      paymentMethod?: string | null
      paidAt?: string | null
      gatewayTransactionId?: string | null
    } | null
    supplierTransaction?: {
      supplierOrderId?: string | null
      status: string
      errorMessage?: string | null
    } | null
  }
  className?: string
}

const statusOrder: OrderStatus[] = [
  'PENDING',
  'WAITING_PAYMENT',
  'PAID',
  'PROCESSING',
  'SUCCESS',
  'FAILED',
  'REFUNDED',
  'CANCELLED',
]

export function OrderStatus({ status, order, className }: OrderStatusProps) {
  const currentIndex = statusOrder.indexOf(status)
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  const steps = [
    { key: 'PENDING', label: 'Pesanan Dibuat', icon: Clock },
    { key: 'WAITING_PAYMENT', label: 'Menunggu Bayar', icon: CreditCard },
    { key: 'PAID', label: 'Pembayaran', icon: CheckCircle },
    { key: 'PROCESSING', label: 'Proses Top Up', icon: Truck },
    { key: 'SUCCESS', label: 'Selesai', icon: CheckCircle },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-50">Status Pesanan</h3>
            <p className="mt-1 text-sm text-slate-400">No. Pesanan: {order.orderNumber}</p>
          </div>
          <div className={cn('flex items-center space-x-2 px-4 py-2 rounded-full', config.bg)}>
            <Icon className={cn('h-5 w-5', config.color)} aria-hidden="true" />
            <span className={cn('font-medium', config.color)}>{config.label}</span>
          </div>
        </div>

        {order.failedReason && status === 'FAILED' && (
          <div className="mt-4 p-3 rounded-lg bg-red-900/30 border border-red-600">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <p className="text-sm text-red-300">{order.failedReason}</p>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {steps.map((step, index) => {
            const stepStatus = statusOrder[index]
            const isCompleted = statusOrder.indexOf(stepStatus) < currentIndex
            const isCurrent = stepStatus === status
            const isFuture = statusOrder.indexOf(stepStatus) > currentIndex

            return (
              <div key={step.key} className="flex items-start space-x-4">
                <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
                  ) : isCurrent && status !== 'FAILED' && status !== 'SUCCESS' ? (
                    <Loader2 className="h-5 w-5 text-purple-500 animate-spin" aria-hidden="true" />
                  ) : isCurrent && (status === 'FAILED' || status === 'SUCCESS') ? (
                    <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />
                  ) : (
                    <div className={cn('h-2.5 w-2.5 rounded-full', isFuture ? 'bg-slate-700' : 'bg-purple-500')} />
                  )}
                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 top-10 bottom-0 w-0.5" aria-hidden="true">
                      <div
                        className={cn('h-full', isCompleted || isCurrent ? 'bg-purple-500' : 'bg-slate-700')}
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p className={cn('font-medium', isCurrent || isCompleted ? 'text-slate-50' : 'text-slate-500')}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-sm text-slate-400">
                      {status === 'PROCESSING' && 'Sedang memproses top-up ke server game...'}
                      {status === 'WAITING_PAYMENT' && 'Silakan lakukan pembayaran dalam 24 jam'}
                      {status === 'PAID' && 'Pembayaran terverifikasi, menunggu proses top-up'}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">Game</p>
          <p className="mt-1 font-medium text-slate-50">{order.game.name}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">Produk</p>
          <p className="mt-1 font-medium text-slate-50">{order.product.name}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">User ID</p>
          <p className="mt-1 font-medium text-slate-50">{order.userGameId}</p>
        </div>
        {order.userZoneId && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-sm text-slate-400">Zone ID</p>
            <p className="mt-1 font-medium text-slate-50">{order.userZoneId}</p>
          </div>
        )}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">Jumlah</p>
          <p className="mt-1 font-medium text-slate-50">× {order.quantity}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">Total</p>
          <p className="mt-1 font-bold text-purple-400">{formatPrice(order.totalPrice)}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">Dibuat</p>
          <p className="mt-1 font-medium text-slate-50">{formatDateTime(order.createdAt)}</p>
        </div>
        {order.paidAt && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-sm text-slate-400">Dibayar</p>
            <p className="mt-1 font-medium text-slate-50">{formatDateTime(order.paidAt)}</p>
          </div>
        )}
        {order.completedAt && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-sm text-slate-400">Selesai</p>
            <p className="mt-1 font-medium text-slate-50">{formatDateTime(order.completedAt)}</p>
          </div>
        )}
        {order.payment?.paymentMethod && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-sm text-slate-400">Metode Bayar</p>
            <p className="mt-1 font-medium text-slate-50">{order.payment.paymentMethod}</p>
          </div>
        )}
        {order.supplierTransaction?.supplierOrderId && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-sm text-slate-400">Supplier Ref</p>
            <p className="mt-1 font-mono text-sm text-slate-50">{order.supplierTransaction.supplierOrderId}</p>
          </div>
        )}
      </div>
    </div>
  )
}