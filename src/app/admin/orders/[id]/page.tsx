'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Loader2, AlertCircle, CheckCircle, XCircle, Truck, CreditCard, Clock, RotateCcw } from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import { formatDate } from '@/lib/utils/format'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/constants'
import { cn } from '@/lib/utils/helpers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AdminOrderDetail {
  id: string
  orderNumber: string
  status: string
  createdAt: string
  updatedAt: string
  paidAt?: string | null
  completedAt?: string | null
  failedReason?: string | null
  user: { id: string; email: string; fullName?: string | null; phone?: string | null }
  product: { id: string; name: string; denomination: number; sellPrice: number; game: { name: string; logo: string; slug: string } }
  game: { name: string; logo: string; slug: string }
  userGameId: string
  userZoneId?: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  payment?: { paymentMethod?: string | null; paidAt?: string | null; gatewayTransactionId?: string | null; gatewayResponse?: any } | null
  supplierTransaction?: { supplierOrderId?: string | null; status: string; responsePayload?: any; errorMessage?: string | null } | null
}

const statusOptions = [
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'WAITING_PAYMENT', label: 'Menunggu Bayar' },
  { value: 'PAID', label: 'Dibayar' },
  { value: 'PROCESSING', label: 'Diproses' },
  { value: 'SUCCESS', label: 'Berhasil' },
  { value: 'FAILED', label: 'Gagal' },
  { value: 'REFUNDED', label: 'Dikembalikan' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
]

export default function AdminOrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<AdminOrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`)
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Pesanan tidak ditemukan')
        setOrder(data.order)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat pesanan')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const handleStatusChange = async () => {
    if (!order || !newStatus) return

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status: newStatus }),
      })

      if (response.ok) {
        setOrder((prev) => prev ? { ...prev, status: newStatus } : null)
        setDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-slate-50">Pesanan Tidak Ditemukan</h1>
          <p className="mt-2 text-slate-400">{error}</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Detail Pesanan</h1>
            <p className="text-slate-400">No. Pesanan: <span className="font-mono text-purple-400">{order.orderNumber}</span></p>
          </div>
          <Button onClick={() => { setNewStatus(order.status); setDialogOpen(true); }}>
            Ubah Status
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center space-x-2">
                <span className="text-purple-500">📦</span>
                <span>Informasi Pesanan</span>
              </h3>
              <dl className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <dt className="text-slate-400">No. Pesanan</dt>
                  <dd className="font-mono text-slate-50">{order.orderNumber}</dd>
                  <dt className="text-slate-400">Status</dt>
                  <dd>
                    <Badge variant="outline" className={ORDER_STATUS_COLORS[order.status]}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </Badge>
                  </dd>
                  <dt className="text-slate-400">Game</dt>
                  <dd className="font-medium text-slate-50">{order.game.name}</dd>
                  <dt className="text-slate-400">Produk</dt>
                  <dd className="font-medium text-slate-50">{order.product.name}</dd>
                  <dt className="text-slate-400">User ID</dt>
                  <dd className="font-mono text-slate-50">{order.userGameId}</dd>
                  {order.userZoneId && (
                    <>
                      <dt className="text-slate-400">Zone ID</dt>
                      <dd className="font-mono text-slate-50">{order.userZoneId}</dd>
                    </>
                  )}
                  <dt className="text-slate-400">Jumlah</dt>
                  <dd className="font-medium text-slate-50">× {order.quantity}</dd>
                  <dt className="text-slate-400">Total</dt>
                  <dd className="font-bold text-purple-400">{formatPrice(order.totalPrice)}</dd>
                  <dt className="text-slate-400">Dibuat</dt>
                  <dd className="text-slate-500">{formatDate(order.createdAt)}</dd>
                  {order.paidAt && (
                    <>
                      <dt className="text-slate-400">Dibayar</dt>
                      <dd className="text-slate-500">{formatDate(order.paidAt)}</dd>
                    </>
                  )}
                  {order.completedAt && (
                    <>
                      <dt className="text-slate-400">Selesai</dt>
                      <dd className="text-slate-500">{formatDate(order.completedAt)}</dd>
                    </>
                  )}
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center space-x-2">
                <span className="text-purple-500">👤</span>
                <span>Informasi Pelanggan</span>
              </h3>
              <dl className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <dt className="text-slate-400">Nama</dt>
                  <dd className="font-medium text-slate-50">{order.user.fullName || '-'}</dd>
                  <dt className="text-slate-400">Email</dt>
                  <dd className="font-medium text-slate-50">{order.user.email}</dd>
                  <dt className="text-slate-400">Telepon</dt>
                  <dd className="font-medium text-slate-50">{order.user.phone || '-'}</dd>
                </div>
              </dl>
            </div>

            {order.payment && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                  <span>Informasi Pembayaran</span>
                </h3>
                <dl className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <dt className="text-slate-400">Metode</dt>
                    <dd className="font-medium text-slate-50">{order.payment.paymentMethod || '-'}</dd>
                    <dt className="text-slate-400">Gateway Ref</dt>
                    <dd className="font-mono text-sm text-slate-50">{order.payment.gatewayTransactionId || '-'}</dd>
                    <dt className="text-slate-400">Waktu Bayar</dt>
                    <dd className="text-slate-500">{order.payment.paidAt ? formatDate(order.payment.paidAt) : '-'}</dd>
                  </div>
                </dl>
              </div>
            )}

            {order.supplierTransaction && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                <h3 className="text-lg font-semibold text-slate-50 mb-4 flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-purple-500" />
                  <span>Proses Supplier</span>
                </h3>
                <dl className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <dt className="text-slate-400">Status Supplier</dt>
                    <dd>
                      <Badge variant="outline" className={ORDER_STATUS_COLORS[order.supplierTransaction.status]}>
                        {ORDER_STATUS_LABELS[order.supplierTransaction.status] || order.supplierTransaction.status}
                      </Badge>
                    </dd>
                    <dt className="text-slate-400">Supplier Ref</dt>
                    <dd className="font-mono text-sm text-slate-50">{order.supplierTransaction.supplierOrderId || '-'}</dd>
                    {order.supplierTransaction.errorMessage && (
                      <>
                        <dt className="text-slate-400">Error</dt>
                        <dd className="text-red-400 text-sm">{order.supplierTransaction.errorMessage}</dd>
                      </>
                    )}
                  </div>
                </dl>
              </div>
            )}

            {order.failedReason && (
              <div className="rounded-xl border border-red-600 bg-red-900/30 p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center space-x-2">
                  <XCircle className="h-5 w-5" />
                  <span>Alasan Gagal</span>
                </h3>
                <p className="text-red-300">{order.failedReason}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-slate-50 mb-4">Aksi Cepat</h3>
              <div className="space-y-3">
                <Button onClick={() => { setNewStatus(order.status); setDialogOpen(true); }} className="w-full">
                  Ubah Status
                </Button>
                {order.status === 'FAILED' && (
                  <Button variant="outline" className="w-full" onClick={() => { setNewStatus('PROCESSING'); setDialogOpen(true); }}>
                    Coba Proses Ulang
                  </Button>
                )}
                {order.status === 'PAID' && !order.supplierTransaction && (
                  <Button variant="outline" className="w-full" onClick={() => { setNewStatus('PROCESSING'); setDialogOpen(true); }}>
                    Proses Manual
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ubah Status Pesanan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-slate-400">No. Pesanan: <span className="font-mono text-slate-50">{order.orderNumber}</span></p>
              <p className="text-sm text-slate-400">Status Saat Ini: <Badge variant="outline" className={ORDER_STATUS_COLORS[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge></p>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status Baru</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button onClick={handleStatusChange} disabled={!newStatus}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}