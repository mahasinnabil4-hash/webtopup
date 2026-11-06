'use client'

import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/toaster'
import { AdminLoginForm } from './AdminLoginForm'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center pt-20 px-4 py-12">
        <Suspense fallback={<div className="w-full max-w-md" />}>
          <AdminLoginForm />
        </Suspense>
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}