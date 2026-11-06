'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, User, LogOut, ShoppingBag, Gamepad2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils/helpers'
import { Button } from '@/components/ui/button'

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Beranda', href: '/' },
    { name: 'Game', href: '/games' },
    { name: 'Cek Pesanan', href: '/check-order' },
    { name: 'Kontak', href: '/contact' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2" aria-label="NEXATOPUP Home">
            <Gamepad2 className="h-8 w-8 text-purple-500" aria-hidden="true" />
            <span className="text-xl font-bold text-slate-50">NEXATOPUP</span>
          </Link>
        </div>

        <div className="hidden md:flex md:items-center md:space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-purple-400"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex md:items-center md:space-x-4">
          {status === 'loading' ? (
            <div className="h-10 w-24 animate-pulse rounded-md bg-slate-800" />
          ) : session?.user ? (
            <>
              <Link href="/orders" className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-purple-400">
                <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                <span>Pesanan</span>
              </Link>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400 hidden sm:block">{session.user.name || session.user.email}</span>
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Logout</span>
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-purple-400">
                Login
              </Link>
              <Link href="/register">
                <Button size="sm">Daftar</Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-slate-50 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950" id="mobile-menu">
          <div className="space-y-1 px-4 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-purple-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <hr className="border-slate-800 my-4" />
            {session?.user ? (
              <>
                <Link
                  href="/orders"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-purple-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pesanan Saya
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-purple-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-purple-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-purple-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}