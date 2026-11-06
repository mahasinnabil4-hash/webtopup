import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GameCard } from '@/components/customer/GameCard'
import { EmptyGameCatalog } from '@/components/customer/EmptyGameCatalog'
import { getActiveGames } from '@/lib/db/queries/games'
import { Toaster } from '@/components/ui/toaster'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'NEXATOPUP - Top Up Game Murah, Cepat & Aman',
  description: 'Platform top-up game terpercaya di Indonesia. Mobile Legends, Free Fire, PUBG, Genshin Impact, dll. Bayar via QRIS, GoPay, DANA, OVO, ShopeePay, Virtual Account.',
  keywords: ['top up game', 'mobile legends', 'free fire', 'pubg mobile', 'genshin impact', 'valorant', 'roblox', 'diamond', 'uc', 'topup murah'],
  openGraph: {
    title: 'NEXATOPUP - Top Up Game Murah, Cepat & Aman',
    description: 'Platform top-up game terpercaya di Indonesia. Bayar via QRIS, GoPay, DANA, OVO, ShopeePay, Virtual Account.',
    type: 'website',
  },
}

export default async function HomePage() {
  const games = await getActiveGames()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-50">
                Top Up Game <span className="text-purple-500">Murah, Cepat & Aman</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto">
                Platform top-up game terpercaya Indonesia. Mobile Legends, Free Fire, PUBG, Genshin Impact, Valorant, Roblox, dll.
                Bayar via QRIS, GoPay, DANA, OVO, ShopeePay, Virtual Account, Alfamart, Indomaret.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/games">
                  <button className="px-8 py-4 text-lg font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto">
                    Mulai Top Up Sekarang
                  </button>
                </a>
                <a href="/check-order">
                  <button className="px-8 py-4 text-lg font-medium text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800 hover:text-slate-50 transition-colors w-full sm:w-auto">
                    Cek Status Pesanan
                  </button>
                </a>
              </div>
            </div>

            <div className="mt-20 grid gap-8 md:grid-cols-3">
              {[
                { icon: '⚡', title: 'Proses Cepat', desc: 'Top-up otomatis dalam hitungan detik setelah pembayaran terverifikasi' },
                { icon: '🔒', title: '100% Aman', desc: 'Transaksi terenkripsi, data pelanggan terlindungi, tidak ada data sensitif yang disimpan' },
                { icon: '💰', title: 'Harga Terbaik', desc: 'Harga kompetitif langsung dari supplier, tanpa biaya tersembunyi' },
                { icon: '📱', title: 'Banyak Metode Bayar', desc: 'QRIS, GoPay, DANA, OVO, ShopeePay, VA Bank, Alfamart, Indomaret' },
                { icon: '🎮', title: 'Game Populer', desc: 'Mobile Legends, Free Fire, PUBG, Genshin, Valorant, Roblox, dll' },
                { icon: '🛟', title: 'Support 24/7', desc: 'Tim support siap membantu via chat, email, dan WhatsApp' },
              ].map((feature, i) => (
                <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-colors hover:border-purple-500/50">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-slate-50">{feature.title}</h3>
                  <p className="mt-2 text-slate-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24 bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-slate-50">Game Populer</h2>
                <p className="mt-2 text-slate-400">Pilih game favorit Anda dan top-up sekarang</p>
              </div>
              <a href="/games" className="text-purple-400 hover:text-purple-300 font-medium text-sm">
                Lihat Semua →
              </a>
            </div>

            {games.length === 0 ? (
              <EmptyGameCatalog />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {games.slice(0, 8).map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-slate-50">Siap Top Up?</h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan gamer Indonesia yang sudah mempercayai NEXATOPUP untuk kebutuhan top-up game mereka.
            </p>
            <div className="mt-10">
              <a href="/games">
                <button className="px-10 py-4 text-lg font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                  Mulai Top Up Sekarang
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}