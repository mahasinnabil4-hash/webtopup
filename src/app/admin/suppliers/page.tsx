'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { DataTable } from '@/components/admin/DataTable'
import { Loader2, Plus, Search, Edit, Trash2, Link2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SUPPLIER_STATUS_LABELS } from '@/constants'

interface AdminSupplier {
  id: string
  name: string
  code: string
  baseUrl?: string | null
  apiKey?: string | null
  apiSecret?: string | null
  username?: string | null
  password?: string | null
  callbackUrl?: string | null
  status: string
  config?: any
  isManual: boolean
  _count?: { gameMappings: number; productMappings: number }
}

const supplierSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  code: z.string().min(2, 'Kode minimal 2 karakter').regex(/^[A-Z0-9_]+$/, 'Kode hanya huruf besar, angka, dan underscore'),
  baseUrl: z.string().url('URL tidak valid').optional().nullable(),
  apiKey: z.string().optional().nullable(),
  apiSecret: z.string().optional().nullable(),
  username: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  callbackUrl: z.string().url('URL callback tidak valid').optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).default('ACTIVE'),
  config: z.any().optional().nullable(),
  isManual: z.boolean().default(false),
})

type SupplierFormData = z.infer<typeof supplierSchema>

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<AdminSupplier | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      code: '',
      baseUrl: '',
      apiKey: '',
      apiSecret: '',
      username: '',
      password: '',
      callbackUrl: '',
      status: 'ACTIVE',
      config: null,
      isManual: false,
    },
  })

  const watchedIsManual = watch('isManual', false)

  useEffect(() => {
    const fetchSuppliers = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('limit', limit.toString())
        if (search) params.append('search', search)
        if (statusFilter) params.append('status', statusFilter)

        const response = await fetch(`/api/admin/suppliers?${params.toString()}`)
        const data = await response.json()
        if (response.ok) {
          setSuppliers(data.suppliers)
          setTotal(data.total)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('Failed to fetch suppliers:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuppliers()
  }, [page, search, statusFilter])

  const openCreateDialog = () => {
    setEditingSupplier(null)
    reset({ name: '', code: '', baseUrl: '', apiKey: '', apiSecret: '', username: '', password: '', callbackUrl: '', status: 'ACTIVE', config: null, isManual: false })
    setDialogOpen(true)
  }

  const openEditDialog = (supplier: AdminSupplier) => {
    setEditingSupplier(supplier)
    reset({
      name: supplier.name,
      code: supplier.code,
      baseUrl: supplier.baseUrl || '',
      apiKey: supplier.apiKey || '',
      apiSecret: supplier.apiSecret || '',
      username: supplier.username || '',
      password: supplier.password || '',
      callbackUrl: supplier.callbackUrl || '',
      status: supplier.status as SupplierFormData['status'],
      config: supplier.config,
      isManual: supplier.isManual,
    })
    setDialogOpen(true)
  }

  const onSubmit = async (data: SupplierFormData) => {
    setIsSubmitting(true)
    try {
      const url = editingSupplier ? `/api/admin/suppliers/${editingSupplier.id}` : '/api/admin/suppliers'
      const method = editingSupplier ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setDialogOpen(false)
        setEditingSupplier(null)
        const fetchParams = new URLSearchParams()
        fetchParams.append('page', page.toString())
        fetchParams.append('limit', limit.toString())
        if (search) fetchParams.append('search', search)
        if (statusFilter) fetchParams.append('status', statusFilter)
        const fetchResponse = await fetch(`/api/admin/suppliers?${fetchParams.toString()}`)
        const fetchData = await fetchResponse.json()
        if (fetchResponse.ok) {
          setSuppliers(fetchData.suppliers)
          setTotal(fetchData.total)
          setTotalPages(fetchData.totalPages)
        }
      }
    } catch (error) {
      console.error('Failed to save supplier:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus supplier ini?')) return

    try {
      const response = await fetch(`/api/admin/suppliers/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setSuppliers((prev) => prev.filter((s) => s.id !== id))
        setTotal((prev) => prev - 1)
      }
    } catch (error) {
      console.error('Failed to delete supplier:', error)
    }
  }

  const columns = [
    { key: 'name', header: 'Nama', render: (row: AdminSupplier) => (
      <div>
        <p className="font-medium text-slate-50">{row.name}</p>
        <p className="text-xs text-slate-400 font-mono">{row.code}</p>
      </div>
    )},
    { key: 'status', header: 'Status', render: (row: AdminSupplier) => (
      <Badge variant="outline" className={getStatusColor(row.status)}>
        {SUPPLIER_STATUS_LABELS[row.status] || row.status}
      </Badge>
    )},
    { key: 'type', header: 'Tipe', render: (row: AdminSupplier) => (
      <Badge variant={row.isManual ? 'default' : 'secondary'}>
        {row.isManual ? 'Manual' : 'API'}
      </Badge>
    )},
    { key: 'baseUrl', header: 'Base URL', render: (row: AdminSupplier) => (
      <span className="text-slate-400 text-sm truncate max-w-[200px] block">{row.baseUrl || '-'}</span>
    )},
    { key: 'gameMappings', header: 'Game Mapping', render: (row: AdminSupplier) => (
      <span className="text-slate-400">{row._count?.gameMappings || 0} game</span>
    )},
    { key: 'productMappings', header: 'Produk Mapping', render: (row: AdminSupplier) => (
      <span className="text-slate-400">{row._count?.productMappings || 0} produk</span>
    )},
    { key: 'actions', header: 'Aksi', render: (row: AdminSupplier) => (
      <div className="flex items-center space-x-2">
        <button onClick={() => openEditDialog(row)} className="p-2 text-slate-400 hover:text-purple-400" title="Edit">
          <Edit className="h-4 w-4" />
        </button>
        <button onClick={() => handleDelete(row.id)} className="p-2 text-slate-400 hover:text-red-400" title="Hapus">
          <Trash2 className="h-4 w-4" />
        </button>
        <a href={`/admin/suppliers/${row.id}/mappings`} className="p-2 text-slate-400 hover:text-purple-400" title="Mapping">
          <Link2 className="h-4 w-4" />
        </a>
        {!row.isManual && (
          <button className="p-2 text-slate-400 hover:text-green-400" title="Test Koneksi">
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>
    )},
  ]

  function getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'bg-green-900/30 text-green-400 border-green-600'
      case 'INACTIVE': return 'bg-slate-900/50 text-slate-400 border-slate-700'
      case 'MAINTENANCE': return 'bg-yellow-900/30 text-yellow-400 border-yellow-600'
      default: return 'bg-slate-900/50 text-slate-400 border-slate-700'
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Manajemen Supplier</h1>
            <p className="text-slate-400">Kelola supplier top-up (API & Manual)</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Supplier
          </Button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Cari nama supplier atau kode..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
                  <SelectItem value="">Semua Status</SelectItem>
                  <SelectItem value="ACTIVE">Aktif</SelectItem>
                  <SelectItem value="INACTIVE">Nonaktif</SelectItem>
                  <SelectItem value="MAINTENANCE">Pemeliharaan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <DataTable
            data={suppliers}
            columns={columns}
            keyField="id"
            emptyMessage="Belum ada supplier"
            className="min-w-[1100px]"
          />
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Menampilkan {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} dari {total} supplier
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Sebelumnya
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Selanjutnya
              </Button>
            </div>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Tambah Supplier Baru'}</DialogTitle>
              <DialogDescription>Konfigurasi supplier top-up</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Nama Supplier *" error={errors.name?.message} {...register('name')} required />
              <Input label="Kode Supplier *" placeholder="DIGIFLAZZ" error={errors.code?.message} {...register('code')} required />
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Tipe Supplier</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="false" className="h-4 w-4 text-purple-600 border-slate-700" {...register('isManual', { setValueAs: (value) => value === 'true' })} />
                    <span className="text-sm text-slate-300">API (Otomatis)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" value="true" className="h-4 w-4 text-purple-600 border-slate-700" {...register('isManual', { setValueAs: (value) => value === 'true' })} />
                    <span className="text-sm text-slate-300">Manual (Admin Proses)</span>
                  </label>
                </div>
              </div>

              {!watchedIsManual && (
                <div className="space-y-4 border-t border-slate-800 pt-4">
                  <h4 className="font-medium text-slate-50">Konfigurasi API</h4>
                  <Input label="Base URL API" placeholder="https://api.example.com/v1" error={errors.baseUrl?.message} {...register('baseUrl')} />
                  <Input label="API Key" placeholder="your_api_key" type="password" error={errors.apiKey?.message} {...register('apiKey')} />
                  <Input label="API Secret" placeholder="your_api_secret" type="password" error={errors.apiSecret?.message} {...register('apiSecret')} />
                  <Input label="Username" placeholder="your_username" error={errors.username?.message} {...register('username')} />
                  <Input label="Password" placeholder="your_password" type="password" error={errors.password?.message} {...register('password')} />
                  <Input label="Callback URL" placeholder="https://yourdomain.com/api/supplier/callback" error={errors.callbackUrl?.message} {...register('callbackUrl')} />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Status</label>
                <Select onValueChange={(v) => register('status').onChange({ target: { value: v } })} value={watch('status')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Aktif</SelectItem>
                    <SelectItem value="INACTIVE">Nonaktif</SelectItem>
                    <SelectItem value="MAINTENANCE">Pemeliharaan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
                {editingSupplier ? 'Update' : 'Tambah'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}