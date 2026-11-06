import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'NEXATOPUP - Top Up Game Murah, Cepat & Aman',
  description: 'Platform top-up game terpercaya Indonesia. Mobile Legends, Free Fire, PUBG, Genshin Impact, Valorant, Roblox. Bayar via QRIS, GoPay, DANA, OVO, ShopeePay, Virtual Account.',
  keywords: ['top up game', 'mobile legends', 'free fire', 'pubg mobile', 'genshin impact', 'valorant', 'roblox', 'diamond', 'uc', 'topup murah'],
  authors: [{ name: 'NEXATOPUP' }],
  openGraph: {
    title: 'NEXATOPUP - Top Up Game Murah, Cepat & Aman',
    description: 'Platform top-up game terpercaya Indonesia. Bayar via QRIS, GoPay, DANA, OVO, ShopeePay, Virtual Account.',
    type: 'website',
    locale: 'id_ID',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}