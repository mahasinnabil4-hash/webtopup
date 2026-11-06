'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Gamepad2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'

interface GameCardProps {
  game: {
    id: string
    name: string
    slug: string
    logo: string
    banner?: string | null
    description?: string | null
    isActive: boolean
  }
  variant?: 'default' | 'compact' | 'featured'
}

export function GameCard({ game, variant = 'default' }: GameCardProps) {
  const baseStyles = 'group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 transition-all hover:border-purple-600/50 hover:shadow-lg hover:shadow-purple-500/10'

  const variants = {
    default: 'aspect-[4/3]',
    compact: 'aspect-[16/9]',
    featured: 'aspect-[16/9] md:aspect-[21/9]',
  }

  return (
    <Link
      href={`/games/${game.slug}`}
      className={cn(baseStyles, variants[variant], 'flex flex-col')}
      aria-label={`Lihat detail ${game.name}`}
    >
      <div className={cn('relative overflow-hidden', variant === 'featured' ? 'h-64' : 'h-48')}>
        {game.banner ? (
          <Image
            src={game.banner}
            alt={`${game.name} banner`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <Gamepad2 className="h-12 w-12 text-slate-600" aria-hidden="true" />
          </div>
        )}
        {!game.isActive && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="px-3 py-1 text-xs font-medium text-red-400 bg-red-900/50 rounded-full">
              Nonaktif
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center space-x-3">
          <div className="relative h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800">
            {game.logo ? (
              <Image
                src={game.logo}
                alt={`${game.name} logo`}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <Gamepad2 className="h-8 w-8 text-slate-500 mx-auto my-auto" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-slate-50 group-hover:text-purple-400 transition-colors">
              {game.name}
            </h3>
            {game.description && (
              <p className="truncate text-sm text-slate-400">{game.description}</p>
            )}
          </div>
        </div>

        {variant === 'featured' && game.description && (
          <p className="mt-3 flex-1 text-sm text-slate-400 line-clamp-2">{game.description}</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-purple-400">
            Lihat Produk
            <ExternalLink className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <span className="text-xs text-slate-500">Populer</span>
        </div>
      </div>
    </Link>
  )
}