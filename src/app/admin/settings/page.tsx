'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Loader2, Save, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast'
import { useToast } from '@/hooks/useToast'
import { SETTING_KEYS } from '@/lib/db/queries/settings'

interface Setting {
  key: string
  value: any
  description?: string | null
  isPublic: boolean
  updatedAt: string
}

const SETTING_GROUPS = {
  'site.': 'Website',
  'payment.': 'Payment Gateway',
  'email.': 'Email',
  'supplier.': 'Supplier',
} as const

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings')
        const data = await response.json()
        if (response.ok) setSettings(data.settings)
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async (key: string, value: any) => {
    setSavingKey(key)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      if (response.ok) {
        toast({ title: 'Berhasil', description: `Pengaturan ${key} disimpan` })
        const updated = settings.map((s) => s.key === key ? { ...s, value, updatedAt: new Date().toISOString() } : s)
        setSettings(updated)
      } else {
        toast({ title: 'Gagal', description: 'Gagal menyimpan pengaturan', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setSavingKey(null)
    }
  }

  const getGroup = (key: string) => {
    for (const [prefix, group] of Object.entries(SETTING_GROUPS)) {
      if (key.startsWith(prefix)) return group
    }
    return 'Lainnya'
  }

  const groupedSettings = settings.reduce((acc, setting) => {
    const group = getGroup(setting.key)
    if (!acc[group]) acc[group] = []
    acc[group].push(setting)
    return acc
  }, {} as Record<string, Setting[]>)

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Pengaturan</h1>
          <p className="text-slate-400">Konfigurasi website, payment gateway, email, dan supplier</p>
        </div>

        <ToastProvider>
          {Object.entries(groupedSettings).map(([group, groupSettings]) => (
            <div key={group} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <h2 className="text-xl font-semibold text-slate-50 mb-6">{group}</h2>
              <div className="space-y-6">
                {groupSettings.map((setting) => (
                  <div key={setting.key} className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">
                      {setting.key}
                      {setting.isPublic && <span className="ml-2 text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">Public</span>}
                    </label>
                    {setting.description && <p className="text-xs text-slate-500">{setting.description}</p>}
                    <input
                      type="text"
                      defaultValue={typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value, null, 2)}
                      onBlur={(e) => handleSave(setting.key, tryParseJson(e.target.value))}
                      className="w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                      placeholder="Masukkan nilai (JSON untuk object/array)"
                    />
                    <p className="text-xs text-slate-500">Terakhir diupdate: {new Date(setting.updatedAt).toLocaleString('id-ID')}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </ToastProvider>
        <ToastViewport />
      </div>
    </AdminLayout>
  )
}

function tryParseJson(value: string): any {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}