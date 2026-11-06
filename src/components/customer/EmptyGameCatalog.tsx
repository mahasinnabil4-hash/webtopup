import Link from 'next/link'
import { ArrowRight, Gamepad2 } from 'lucide-react'

export function EmptyGameCatalog() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-12 text-center sm:px-10">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
        <Gamepad2 className="h-8 w-8 text-purple-400" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-semibold text-slate-50">Katalog game sedang disiapkan</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
        Belum ada game yang tersedia saat ini. Silakan kembali lagi nanti atau hubungi tim kami untuk bantuan.
      </p>
      <Link
        href="/contact"
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-purple-500/50 hover:bg-slate-800"
      >
        Hubungi kami
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  )
}
