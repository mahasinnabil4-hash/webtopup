'use client'

import { cn } from '@/lib/utils/helpers'

interface StatCard {
  title: string
  value: string | number
  change?: string
  icon: React.ReactNode
  color: string
}

interface StatsCardsProps {
  stats: StatCard[]
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={cn(
            'rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition-colors hover:border-purple-500/50',
            'group'
          )}
        >
          <div className="flex items-start justify-between">
            <div className={cn('p-3 rounded-lg', stat.color)}>
              {stat.icon}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-400">{stat.title}</p>
            <p className="mt-1 text-2xl font-bold text-slate-50">{stat.value}</p>
            {stat.change && (
              <p className="mt-1 text-sm text-green-400">{stat.change}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}