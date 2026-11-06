import { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GameCard } from '@/components/customer/GameCard'
import { EmptyGameCatalog } from '@/components/customer/EmptyGameCatalog'
import { getActiveGames } from '@/lib/db/queries/games'
import { Toaster } from '@/components/ui/toaster'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Daftar Game - NEXATOPUP',
  description: 'Pilih game favorit Anda: Mobile Legends, Free Fire, PUBG Mobile, Genshin Impact, Honor of Kings, Valorant, Roblox, dan banyak lagi.',
}

export default async function GamesPage() {
  const games = await getActiveGames()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-slate-50">Pilih Game</h1>
              <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                Temukan game favorit Anda dan top-up diamond, UC, coins, atau item lainnya dengan harga terbaik
              </p>
            </div>

            {games.length === 0 ? (
              <EmptyGameCatalog />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {games.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}