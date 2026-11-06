'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { DataTable } from '@/components/admin/DataTable'
import { Loader2, Search, UserPlus, Shield, UserCheck, UserX } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/utils/format'

interface AdminUser {
  id: string
  email: string
  fullName?: string | null
  phone?: string | null
  avatar?: string | null
  role: string
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  lastLoginAt?: string | null
  _count?: { orders: number }
}

const adminCreateSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  fullName: z.string().min(2, 'Nama minimal 2 karakter'),
  role: z.enum(['ADMIN', 'SUPER_ADMIN']).default('ADMIN'),
})

type AdminCreateData = z.infer<typeof adminCreateSchema>

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AdminCreateData>({
    resolver: zodResolver(adminCreateSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      role: 'ADMIN',
    },
  })

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('limit', limit.toString())
        if (search) params.append('search', search)
        if (statusFilter) params.append('isActive', statusFilter)
        if (roleFilter) params.append('role', roleFilter)

        const response = await fetch(`/api/admin/users?${params.toString()}`)
        const data = await response.json()
        if (response.ok) {
          setUsers(data.users)
          setTotal(data.total)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [page, search, statusFilter, roleFilter])

  const openCreateDialog = () => {
    reset({ email: '', password: '', fullName: '', role: 'ADMIN' })
    setDialogOpen(true)
  }

  const onSubmit = async (data: AdminCreateData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setDialogOpen(false)
        const fetchParams = new URLSearchParams()
        fetchParams.append('page', page.toString())
        fetchParams.append('limit', limit.toString())
        if (search) fetchParams.append('search', search)
        if (statusFilter) fetchParams.append('isActive', statusFilter)
        if (roleFilter) fetchParams.append('role', roleFilter)
        const fetchResponse = await fetch(`/api/admin/users?${fetchParams.toString()}`)
        const fetchData = await fetchResponse.json()
        if (fetchResponse.ok) {
          setUsers(fetchData.users)
          setTotal(fetchData.total)
          setTotalPages(fetchData.totalPages)
        }
      }
    } catch (error) {
      console.error('Failed to create admin:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (user: AdminUser) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      if (response.ok) {
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      }
    } catch (error) {
      console.error('Failed to toggle user:', error)
    }
  }

  const columns = [
    { key: 'email', header: 'Email', render: (row: AdminUser) => (
      <div>
        <p className="font-medium text-slate-50">{row.email}</p>
        <p className="text-xs text-slate-400">{row.fullName || '-'}</p>
      </div>
    )},
    { key: 'phone', header: 'Telepon', render: (row: AdminUser) => row.phone || '-' },
    { key: 'role', header: 'Peran', render: (row: AdminUser) => (
      <Badge variant={row.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>
        {row.role}
      </Badge>
    )},
    { key: 'isActive', header: 'Status', render: (row: AdminUser) => (
      <Badge variant={row.isActive ? 'success' : 'secondary'}>
        {row.isActive ? 'Aktif' : 'Nonaktif'}
      </Badge>
    )},
    { key: 'emailVerified', header: 'Verified', render: (row: AdminUser) => (
      <Badge variant={row.emailVerified ? 'success' : 'outline'}>
        {row.emailVerified ? 'Ya' : 'Belum'}
      </Badge>
    )},
    { key: 'orders', header: 'Pesanan', render: (row: AdminUser) => (
      <span className="text-slate-400">{row._count?.orders || 0}</span>
    )},
    { key: 'createdAt', header: 'Dibuat', render: (row: AdminUser) => formatDate(row.createdAt) },
    { key: 'lastLogin', header: 'Login Terakhir', render: (row: AdminUser) => (
      <span className="text-slate-400">{row.lastLoginAt ? formatDate(row.lastLoginAt) : 'Belum pernah'}</span>
    )},
    { key: 'actions', header: 'Aksi', render: (row: AdminUser) => (
      <button
        onClick={() => handleToggleActive(row)}
        className="p-2 text-slate-400 hover:text-purple-400"
        title={row.isActive ? 'Nonaktifkan' : 'Aktifkan'}
      >
        {row.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
      </button>
    )},
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Manajemen Pengguna</h1>
            <p className="text-slate-400">Kelola akun pelanggan dan admin</p>
          </div>
          <Button onClick={openCreateDialog}>
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah Admin
          </Button>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Cari email, nama, telepon..."
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
                  <SelectItem value="">Semua</SelectItem>
                  <SelectItem value="true">Aktif</SelectItem>
                  <SelectItem value="false">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter Peran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Peran</SelectItem>
                  <SelectItem value="USER">Pelanggan</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <DataTable
            data={users}
            columns={columns}
            keyField="id"
            emptyMessage="Belum ada pengguna"
            className="min-w-[1000px]"
          />
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Menampilkan {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} dari {total} pengguna
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Admin Baru</DialogTitle>
              <DialogDescription>Buat akun admin baru dengan hak akses penuh</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Email *" error={errors.email?.message} {...register('email')} required />
              <Input label="Password *" type="password" error={errors.password?.message} {...register('password')} required />
              <Input label="Nama Lengkap *" error={errors.fullName?.message} {...register('fullName')} required />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Peran</label>
                <Select onValueChange={(v) => register('role').onChange({ target: { value: v } })} value={watch('role')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih peran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
                Tambah Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}