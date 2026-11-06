'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { DataTable } from '@/components/admin/DataTable'
import { Loader2, Search, Filter, ChevronDown } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { formatPrice } from '@/lib/utils/format'
import { formatDate } from '@/lib/utils/format'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/constants'
import { cn } from '@/lib/utils/helpers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface AdminOrder {
  id: string
  orderNumber: string
  status: string
  createdAt: string
  paidAt?: string | null
  completedAt?: string | null
  failedReason?: string | null
  user: { id: string; email: string; fullName?: string | null; phone?: string | null }
  product: { name: string; game: { name: string } }
  totalPrice: number
  payment?: { paymentMethod?: string | null; gatewayTransactionId?: string | null } | null
  supplierTransaction?: { supplierOrderId?: string | null; status: string } | null
}

const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'WAITING_PAYMENT', label: 'Menunggu Bayar' },
  { value: 'PAID', label: 'Dibayar' },
  { value: 'PROCESSING', label: 'Diproses' },
  { value: 'SUCCESS', label: 'Berhasil' },
  { value: 'FAILED', label: 'Gagal' },
  { value: 'REFUNDED', label: 'Dikembalikan' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
]

export function AdminOrdersContent() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('limit', limit.toString())
        if (search) params.append('search', search)
        if (statusFilter) params.append('status', statusFilter)

        const response = await fetch(`/api/admin/orders?${params.toString()}`)
        const data = await response.json()
        if (response.ok) {
          setOrders(data.orders)
          setTotal(data.total)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [page, search, statusFilter])

  const handleStatusChange = async () => {
    if (!selectedOrder || !newStatus) return

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedOrder.id, status: newStatus }),
      })

      if (response.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o))
        )
        setDialogOpen(false)
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const columns = [
    { key: 'orderNumber', header: 'No. Pesanan', className: 'font-mono text-sm' },
    { key: 'user', header: 'Pelanggan', render: (row: AdminOrder) => (
      <div>
        <p className="font-medium text-slate-50">{row.user.fullName || row.user.email}</p>
        <p className="text-xs text-slate-400">{row.user.phone || row.user.email}</p>
      </div>
    )},
    { key: 'product', header: 'Produk', render: (row: AdminOrder) => (
      <div>
        <p className="font-medium text-slate-50">{row.product.game.name}</p>
        <p className="text-xs text-slate-400">{row.product.name}</p>
      </div>
    )},
    { key: 'totalPrice', header: 'Total', render: (row: AdminOrder) => formatPrice(row.totalPrice), className: 'font-medium text-purple-400' },
    { key: 'status', header: 'Status', render: (row: AdminOrder) => (
      <Badge variant="outline" className={ORDER_STATUS_COLORS[row.status]}>
        {ORDER_STATUS_LABELS[row.status] || row.status}
      </Badge>
    )},
    { key: 'payment', header: 'Pembayaran', render: (row: AdminOrder) => row.payment?.paymentMethod ? (
      <span className="text-sm text-slate-400">{row.payment.paymentMethod}</span>
    ) : (
      <span className="text-sm text-slate-500">-</span>
    )},
    { key: 'createdAt', header: 'Tanggal', render: (row: AdminOrder) => formatDate(row.createdAt) },
    { key: 'actions', header: 'Aksi', render: (row: AdminOrder) => (
      <button
        onClick={(e) => { e.stopPropagation(); setSelectedOrder(row); setNewStatus(row.status); setDialogOpen(true); }}
        className="text-sm text-purple-400 hover:text-purple-300"
      >
        Ubah Status
      </button>
    )},
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Manajemen Pesanan</h1>
            <p className="text-slate-400">Kelola dan pantau semua pesanan top-up</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Cari no. pesanan, user ID, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <DataTable
            data={orders}
            columns={columns}
            keyField="id"
            emptyMessage="Tidak ada pesanan ditemukan"
            className="min-w-[1000px]"
          />
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Menampilkan {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} dari {total} pesanan
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Status Pesanan</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">No. Pesanan: <span className="font-mono text-slate-50">{selectedOrder.orderNumber}</span></p>
              <p className="text-sm text-slate-400">Status Saat Ini: <Badge variant="outline" className={ORDER_STATUS_COLORS[selectedOrder.status]}>{ORDER_STATUS_LABELS[selectedOrder.status]}</Badge></p>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status Baru</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.filter((o) => o.value).map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleStatusChange} disabled={!newStatus}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}