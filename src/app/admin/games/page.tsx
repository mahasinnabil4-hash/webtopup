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

interface AdminGame {
  id: string
  name: string
  slug: string
  logo: string
  banner?: string | null
  description?: string | null
  isActive: boolean
  sortOrder: number
  _count?: { products: number }
  supplierMappings?: Array<{ supplier: { name: string; code: string } }>
}

const gameSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  slug: z.string().min(2, 'Slug minimal 2 karakter').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh huruf kecil, angka, dan strip'),
  logo: z.string().url('URL logo tidak valid'),
  banner: z.string().url('URL banner tidak valid').optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
})

type GameFormData = z.infer<typeof gameSchema>

export default function AdminGamesPage() {
  const [games, setGames] = useState<AdminGame[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<AdminGame | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<GameFormData>({
    resolver: zodResolver(gameSchema),
    defaultValues: {
      name: '',
      slug: '',
      logo: '',
      banner: '',
      description: '',
      isActive: true,
      sortOrder: 0,
    },
  })

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('limit', limit.toString())
        if (search) params.append('search', search)

        const response = await fetch(`/api/admin/games?${params.toString()}`)
        const data = await response.json()
        if (response.ok) {
          setGames(data.games)
          setTotal(data.total)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('Failed to fetch games:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGames()
  }, [page, search])

  const openCreateDialog = () => {
    setEditingGame(null)
    reset({ name: '', slug: '', logo: '', banner: '', description: '', isActive: true, sortOrder: 0 })
    setDialogOpen(true)
  }

  const openEditDialog = (game: AdminGame) => {
    setEditingGame(game)
    reset({
      name: game.name,
      slug: game.slug,
      logo: game.logo,
      banner: game.banner || '',
      description: game.description || '',
      isActive: game.isActive,
      sortOrder: game.sortOrder,
    })
    setDialogOpen(true)
  }

  const onSubmit = async (data: GameFormData) => {
    setIsSubmitting(true)
    try {
      const url = editingGame ? `/api/admin/games/${editingGame.id}` : '/api/admin/games'
      const method = editingGame ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setDialogOpen(false)
        setEditingGame(null)
        const fetchParams = new URLSearchParams()
        fetchParams.append('page', page.toString())
        fetchParams.append('limit', limit.toString())
        if (search) fetchParams.append('search', search)
        const fetchResponse = await fetch(`/api/admin/games?${fetchParams.toString()}`)
        const fetchData = await fetchResponse.json()
        if (fetchResponse.ok) {
          setGames(fetchData.games)
          setTotal(fetchData.total)
          setTotalPages(fetchData.totalPages)
        }
      }
    } catch (error) {
      console.error('Failed to save game:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus game ini?')) return

    try {
      const response = await fetch(`/api/admin/games/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setGames((prev) => prev.filter((g) => g.id !== id))
        setTotal((prev) => prev - 1)
      }
    } catch (error) {
      console.error('Failed to delete game:', error)
    }
  }

  const columns = [
    { key: 'logo', header: 'Logo', render: (row: AdminGame) => (
      <img src={row.logo} alt="" className="h-10 w-10 rounded-lg object-cover" />
    )},
    { key: 'name', header: 'Nama', render: (row: AdminGame) => (
      <div>
        <p className="font-medium text-slate-50">{row.name}</p>
        <p className="text-xs text-slate-400 font-mono">{row.slug}</p>
      </div>
    )},
    { key: 'banner', header: 'Banner', render: (row: AdminGame) => row.banner ? (
      <img src={row.banner} alt="" className="h-16 w-24 rounded-lg object-cover" />
    ) : (
      <span className="text-slate-500 text-sm">-</span>
    )},
    { key: 'isActive', header: 'Status', render: (row: AdminGame) => (
      <Badge variant={row.isActive ? 'success' : 'secondary'}>
        {row.isActive ? 'Aktif' : 'Nonaktif'}
      </Badge>
    )},
    { key: 'sortOrder', header: 'Urutan', className: 'text-center' },
    { key: 'products', header: 'Produk', render: (row: AdminGame) => (
      <span className="text-slate-400">{row._count?.products || 0} produk</span>
    )},
    { key: 'actions', header: 'Aksi', render: (row: AdminGame) => (
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
            <h1 className="text-3xl font-bold text-slate-50">Manajemen Game</h1>
            <p className="text-slate-400">Kelola daftar game yang tersedia untuk top-up</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Game
          </Button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama game atau slug..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <DataTable
            data={games}
            columns={columns}
            keyField="id"
            emptyMessage="Belum ada game"
            className="min-w-[1000px]"
          />
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Menampilkan {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} dari {total} game
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
              <DialogTitle>{editingGame ? 'Edit Game' : 'Tambah Game Baru'}</DialogTitle>
              <DialogDescription>Isi informasi game di bawah ini</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Nama Game *" error={errors.name?.message} {...register('name')} required />
              <Input label="Slug *" placeholder="mobile-legends" error={errors.slug?.message} {...register('slug')} required />
              <Input label="URL Logo *" placeholder="https://example.com/logo.png" error={errors.logo?.message} {...register('logo')} required />
              <Input label="URL Banner (Opsional)" placeholder="https://example.com/banner.jpg" error={errors.banner?.message} {...register('banner')} />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Deskripsi</label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Deskripsi singkat game..."
                  {...register('description')}
                />
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
            </form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" form={editingGame ? undefined : 'game-form'} loading={isSubmitting} disabled={isSubmitting}>
                {editingGame ? 'Update' : 'Tambah'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}