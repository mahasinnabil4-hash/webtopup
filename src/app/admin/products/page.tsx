'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { DataTable } from '@/components/admin/DataTable'
import { Loader2, Plus, Search, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatPrice } from '@/lib/utils/format'

interface AdminProduct {
  id: string
  name: string
  sku: string
  denomination: number
  costPrice: number
  sellPrice: number
  margin: number
  isActive: boolean
  requiresZone: boolean
  zoneLabel: string
  sortOrder: number
  game: { id: string; name: string; slug: string }
  supplierMappings?: Array<{ supplier: { name: string; code: string } }>
}

const productSchema = z.object({
  gameId: z.string().min(1, 'Game wajib dipilih'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  sku: z.string().min(2, 'SKU minimal 2 karakter').regex(/^[A-Z0-9_-]+$/, 'SKU hanya huruf besar, angka, _, -'),
  denomination: z.number().int().positive('Denomination harus bilangan bulat positif'),
  costPrice: z.number().positive('Harga modal harus positif'),
  sellPrice: z.number().positive('Harga jual harus positif'),
  margin: z.number().min(0).max(1000).default(0),
  isActive: z.boolean().default(true),
  requiresZone: z.boolean().default(false),
  zoneLabel: z.string().max(50).default('Zone ID'),
  sortOrder: z.number().int().min(0).default(0),
})

type ProductFormData = z.infer<typeof productSchema>

interface AdminGame {
  id: string
  name: string
  slug: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [games, setGames] = useState<AdminGame[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [gameFilter, setGameFilter] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      gameId: '',
      name: '',
      sku: '',
      denomination: 1,
      costPrice: 0,
      sellPrice: 0,
      margin: 0,
      isActive: true,
      requiresZone: false,
      zoneLabel: 'Zone ID',
      sortOrder: 0,
    },
  })

  const watchedCostPrice = watch('costPrice', 0)
  const watchedMargin = watch('margin', 0)

  useEffect(() => {
    const fetchGames = async () => {
      const response = await fetch('/api/admin/games?limit=100')
      const data = await response.json()
      if (response.ok) setGames(data.games)
    }
    fetchGames()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('limit', limit.toString())
        if (search) params.append('search', search)
        if (gameFilter) params.append('gameId', gameFilter)

        const response = await fetch(`/api/admin/products?${params.toString()}`)
        const data = await response.json()
        if (response.ok) {
          setProducts(data.products)
          setTotal(data.total)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [page, search, gameFilter])

  useEffect(() => {
    if (watchedCostPrice > 0 && watchedMargin >= 0) {
      const sellPrice = watchedCostPrice * (1 + watchedMargin / 100)
      setValue('sellPrice', Math.round(sellPrice * 100) / 100)
    }
  }, [watchedCostPrice, watchedMargin, setValue])

  const openCreateDialog = () => {
    setEditingProduct(null)
    reset({ gameId: '', name: '', sku: '', denomination: 1, costPrice: 0, sellPrice: 0, margin: 0, isActive: true, requiresZone: false, zoneLabel: 'Zone ID', sortOrder: 0 })
    setDialogOpen(true)
  }

  const openEditDialog = (product: AdminProduct) => {
    setEditingProduct(product)
    reset({
      gameId: product.game.id,
      name: product.name,
      sku: product.sku,
      denomination: product.denomination,
      costPrice: product.costPrice,
      sellPrice: product.sellPrice,
      margin: product.margin,
      isActive: product.isActive,
      requiresZone: product.requiresZone,
      zoneLabel: product.zoneLabel,
      sortOrder: product.sortOrder,
    })
    setDialogOpen(true)
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setDialogOpen(false)
        setEditingProduct(null)
        const fetchParams = new URLSearchParams()
        fetchParams.append('page', page.toString())
        fetchParams.append('limit', limit.toString())
        if (search) fetchParams.append('search', search)
        if (gameFilter) fetchParams.append('gameId', gameFilter)
        const fetchResponse = await fetch(`/api/admin/products?${fetchParams.toString()}`)
        const fetchData = await fetchResponse.json()
        if (fetchResponse.ok) {
          setProducts(fetchData.products)
          setTotal(fetchData.total)
          setTotalPages(fetchData.totalPages)
        }
      }
    } catch (error) {
      console.error('Failed to save product:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return

    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id))
        setTotal((prev) => prev - 1)
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const columns = [
    { key: 'game', header: 'Game', render: (row: AdminProduct) => (
      <p className="font-medium text-slate-50">{row.game.name}</p>
    )},
    { key: 'name', header: 'Nama Produk', render: (row: AdminProduct) => (
      <div>
        <p className="font-medium text-slate-50">{row.name}</p>
        <p className="text-xs text-slate-400 font-mono">{row.sku}</p>
      </div>
    )},
    { key: 'denomination', header: 'Nominal', render: (row: AdminProduct) => (
      <span className="text-slate-500">{row.denomination.toLocaleString('id-ID')}</span>
    )},
    { key: 'costPrice', header: 'Harga Modal', render: (row: AdminProduct) => formatPrice(row.costPrice) },
    { key: 'sellPrice', header: 'Harga Jual', render: (row: AdminProduct) => (
      <span className="font-medium text-purple-400">{formatPrice(row.sellPrice)}</span>
    )},
    { key: 'margin', header: 'Margin', render: (row: AdminProduct) => (
      <span className="text-green-400">{row.margin}%</span>
    )},
    { key: 'isActive', header: 'Status', render: (row: AdminProduct) => (
      <Badge variant={row.isActive ? 'success' : 'secondary'}>
        {row.isActive ? 'Aktif' : 'Nonaktif'}
      </Badge>
    )},
    { key: 'requiresZone', header: 'Zone', render: (row: AdminProduct) => (
      <Badge variant={row.requiresZone ? 'default' : 'outline'}>
        {row.requiresZone ? row.zoneLabel : 'Tidak perlu'}
      </Badge>
    )},
    { key: 'actions', header: 'Aksi', render: (row: AdminProduct) => (
      <div className="flex items-center space-x-2">
        <button onClick={() => openEditDialog(row)} className="p-2 text-slate-400 hover:text-purple-400" title="Edit">
          <Edit className="h-4 w-4" />
        </button>
        <button onClick={() => handleDelete(row.id)} className="p-2 text-slate-400 hover:text-red-400" title="Hapus">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )},
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Manajemen Produk</h1>
            <p className="text-slate-400">Kelola nominal dan harga top-up per game</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Produk
          </Button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Cari nama produk, SKU..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter Game" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Game</SelectItem>
                  {games.map((game) => (
                    <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <DataTable
            data={products}
            columns={columns}
            keyField="id"
            emptyMessage="Belum ada produk"
            className="min-w-[1100px]"
          />
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Menampilkan {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} dari {total} produk
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
              <DialogDescription>Isi informasi produk di bawah ini</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Game *</label>
                <Select onValueChange={(v) => register('gameId').onChange({ target: { value: v } })} value={watch('gameId')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih game" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.map((game) => (
                      <SelectItem key={game.id} value={game.id}>{game.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.gameId && <p className="text-sm text-red-400">{errors.gameId.message}</p>}
              </div>

              <Input label="Nama Produk *" error={errors.name?.message} {...register('name')} required />
              <Input label="SKU *" placeholder="MLBB_86_DIA" error={errors.sku?.message} {...register('sku')} required />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Nominal</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    {...register('denomination', { valueAsNumber: true })}
                  />
                  {errors.denomination && <p className="text-sm text-red-400">{errors.denomination.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Harga Modal</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    {...register('costPrice', { valueAsNumber: true })}
                  />
                  {errors.costPrice && <p className="text-sm text-red-400">{errors.costPrice.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Margin (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1000"
                    className="w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    {...register('margin', { valueAsNumber: true })}
                  />
                  {errors.margin && <p className="text-sm text-red-400">{errors.margin.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Harga Jual (Otomatis: Modal × (1 + Margin%))</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-purple-400 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                  {...register('sellPrice', { valueAsNumber: true })}
                />
                {errors.sellPrice && <p className="text-sm text-red-400">{errors.sellPrice.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Urutan Tampil</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    {...register('sortOrder', { valueAsNumber: true })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="isActive" className="h-4 w-4 rounded border-slate-700 text-purple-600 focus:ring-purple-500" {...register('isActive')} />
                  <label htmlFor="isActive" className="text-sm text-slate-300">Aktif</label>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="requiresZone" className="h-4 w-4 rounded border-slate-700 text-purple-600 focus:ring-purple-500" {...register('requiresZone')} />
                  <label htmlFor="requiresZone" className="text-sm text-slate-300">Perlu Zone ID</label>
                </div>
              </div>

              {watch('requiresZone') && (
                <Input label="Label Zone ID" placeholder="Zone ID / Server ID" {...register('zoneLabel')} />
              )}
            </form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
                {editingProduct ? 'Update' : 'Tambah'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}