'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/toaster'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, Phone, MapPin, MessageSquare, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'

const contactSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subjek minimal 5 karakter'),
  message: z.string().min(20, 'Pesan minimal 20 karakter'),
})

export default function ContactPage() {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: z.infer<typeof contactSchema>) => {
    setSubmitStatus('loading')
    setErrorMessage(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Gagal mengirim pesan')

      setSubmitStatus('success')
      reset()
    } catch (err) {
      setSubmitStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Gagal mengirim pesan')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-slate-50">Hubungi Kami</h1>
              <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                Butuh bantuan? Tim support kami siap membantu Anda 24/7
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3 mb-12">
              {[
                { icon: Mail, title: 'Email', value: 'support@nexatopup.com', desc: 'Balasan dalam 1-2 jam kerja' },
                { icon: Phone, title: 'Telepon', value: '+62 21 1234 5678', desc: 'Senin - Jumat, 09:00 - 18:00 WIB' },
                { icon: MapPin, title: 'Alamat', value: 'Jakarta, Indonesia', desc: 'Kantor pusat NEXATOPUP' },
              ].map((item, i) => (
                <div key={i} className="text-center p-6 rounded-xl border border-slate-800 bg-slate-900/50">
                  <div className="mx-auto h-14 w-14 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                    <item.icon className="h-7 w-7 text-purple-400" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-slate-50">{item.title}</h3>
                  <p className="mt-1 text-purple-400 font-medium">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>

            {submitStatus === 'success' && (
              <div className="mb-8 p-4 rounded-lg bg-green-900/30 border border-green-600 flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <p className="text-green-300">Pesan berhasil dikirim! Tim kami akan merespons segera.</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div className="grid gap-6 sm:grid-cols-2">
                <Input
                  label="Nama Lengkap *"
                  placeholder="Nama Anda"
                  error={errors.name?.message}
                  {...register('name')}
                  required
                />
                <Input
                  label="Email *"
                  placeholder="email@domain.com"
                  type="email"
                  error={errors.email?.message}
                  {...register('email')}
                  required
                />
              </div>

              <Input
                label="Nomor Telepon"
                placeholder="08xxxxxxxxxx"
                type="tel"
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Input
                label="Subjek *"
                placeholder="Subjek pesanan/keluhan"
                error={errors.subject?.message}
                {...register('subject')}
                required
              />

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium text-slate-300">
                  Pesan *
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className={cn(
                    'w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-slate-50 placeholder:text-slate-500',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'transition-colors',
                    errors.message && 'border-red-500 focus:ring-red-500'
                  )}
                  placeholder="Tulis pesan Anda di sini..."
                  {...register('message')}
                  required
                />
                {errors.message && (
                  <p className="text-sm text-red-400" role="alert">{errors.message.message}</p>
                )}
              </div>

              {submitStatus === 'error' && errorMessage && (
                <div className="p-4 rounded-lg bg-red-900/30 border border-red-600 text-red-300">
                  {errorMessage}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" loading={submitStatus === 'loading'} disabled={submitStatus === 'loading'}>
                {submitStatus === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Mengirim...
                  </>
                ) : submitStatus === 'success' ? (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Terkirim!
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Kirim Pesan
                  </>
                )}
              </Button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}