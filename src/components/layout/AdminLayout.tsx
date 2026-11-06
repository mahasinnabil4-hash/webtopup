'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Gamepad2,
  Package,
  Truck,
  Users,
  Settings,
  BarChart2,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Pesanan', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Game', href: '/admin/games', icon: Gamepad2 },
  { name: 'Produk', href: '/admin/products', icon: Package },
  { name: 'Supplier', href: '/admin/suppliers', icon: Truck },
  { name: 'Pengguna', href: '/admin/users', icon: Users },
  { name: 'Statistik', href: '/admin/stats', icon: BarChart2 },
  { name: 'Pengaturan', href: '/admin/settings', icon: Settings },
  { name: 'Log Aktivitas', href: '/admin/logs', icon: Settings },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
    if (status === 'authenticated' && session?.user) {
      const role = (session.user as { role?: string }).role
      if (role && !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
        router.push('/')
      }
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated' || !session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-950 border-r border-slate-800 transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          <Link href="/admin/dashboard" className="flex items-center space-x-2" aria-label="NEXATOPUP Admin">
            <svg className="h-8 w-8 text-purple-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-xl font-bold text-slate-50">NEXATOPUP</span>
          </Link>
          <button
            className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-50 hover:bg-slate-800"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Admin navigation">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-purple-600/20 text-purple-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-50'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-purple-400' : 'text-slate-400')} aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-50 transition-colors"
          >
            <LogOut className="h-5 w-5 text-slate-400" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col lg:pl-64">
        <header className="sticky top-0 z-40 h-16 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
          <div className="flex h-full items-center justify-between px-4 sm:px-6">
            <button
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-50 hover:bg-slate-800"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-800 transition-colors"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-slate-50 font-medium">
                    {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-slate-300">{session.user.name || session.user.email}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md border border-slate-800 bg-slate-950 py-1 shadow-lg z-50">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-sm font-medium text-slate-50">{session.user.name || session.user.email}</p>
                      <p className="text-xs text-slate-400 capitalize">{((session.user as { role?: string }).role || 'USER').toLowerCase()}</p>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: '/admin/login' })}
                      className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-50"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8">{children}</main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}