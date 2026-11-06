import { Suspense } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { AdminOrdersContent } from './AdminOrdersContent'

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<AdminLayout><div className="space-y-6"><div className="h-8 bg-slate-800 rounded animate-pulse" /><div className="h-64 bg-slate-800 rounded animate-pulse" /></div></AdminLayout>}>
      <AdminOrdersContent />
    </Suspense>
  )
}