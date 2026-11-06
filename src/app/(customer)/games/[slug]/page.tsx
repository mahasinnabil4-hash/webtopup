import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ProductSelector } from '@/components/customer/ProductSelector'
import { TopupForm } from '@/components/customer/TopupForm'
import { getGameBySlug } from '@/lib/db/queries/games'
import { Toaster } from '@/components/ui/toaster'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils/format'
import { cn } from '@/lib/utils/helpers'

interface GameDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: GameDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const game = await getGameBySlug(slug)
  
  if (!game) {
    return { title: 'Game Tidak Ditemukan' }
  }

  return {
    title: `Top Up ${game.name} - NEXATOPUP`,
    description: `Beli ${game.name} diamond/UC/coins murah, cepat, aman. Bayar via QRIS, GoPay, DANA, OVO, ShopeePay, Virtual Account.`,
    openGraph: {
      title: `Top Up ${game.name} - NEXATOPUP`,
      description: `Beli ${game.name} diamond/UC/coins murah, cepat, aman.`,
      images: game.banner ? [game.banner] : [],
    },
  }
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { slug } = await params
  const game = await getGameBySlug(slug)

  if (!game || !game.isActive) {
    notFound()
  }

  const products = game.products.filter((p) => p.isActive)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <section className="relative py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-transparent z-0" />
          {game.banner && (
            <div className="absolute inset-0 z-0">
              <Image
                src={game.banner}
                alt={`${game.name} banner`}
                fill
                className="object-cover opacity-30"
                priority
                sizes="100vw"
              />
            </div>
          )}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-slate-800">
                    {game.logo ? (
                      <Image
                        src={game.logo}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-500">🎮</div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-50">{game.name}</h1>
                    <p className="mt-2 text-slate-400">Top up {game.name} diamond, UC, coins, dan item lainnya</p>
                  </div>
                </div>

                {game.description && (
                  <div className="prose prose-invert max-w-none text-slate-400">
                    <p>{game.description}</p>
                  </div>
                )}

                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                  <h2 className="text-xl font-semibold text-slate-50 mb-4">Pilih Nominal</h2>
                  <ProductSelector
                    products={products.map((p) => ({
                      ...p,
                      sellPrice: p.sellPrice.toNumber(),
                      costPrice: p.costPrice.toNumber(),
                      zoneLabel: p.zoneLabel ?? 'Zone ID',
                      game: { name: game.name, slug: game.slug, logo: game.logo },
                    }))}
                    onSelect={() => {}}
                  />
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="sticky top-24">
                  <TopupForm
                    product={{
                      id: products[0]?.id || '',
                      name: products[0]?.name || '',
                      sellPrice: products[0]?.sellPrice.toNumber() || 0,
                      requiresZone: products[0]?.requiresZone || false,
                      zoneLabel: products[0]?.zoneLabel || 'Zone ID',
                      game: { name: game.name, slug: game.slug, logo: game.logo },
                    }}
                    quantity={1}
                    onSubmit={async () => {}}
                    className="rounded-xl border border-slate-800 bg-slate-900/50 p-6"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}