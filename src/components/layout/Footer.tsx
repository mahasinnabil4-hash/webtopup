'use client'

import Link from 'next/link'
import { Gamepad2, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
  product: [
    { name: 'Daftar Game', href: '/games' },
    { name: 'Cara Top Up', href: '/cara-topup' },
    { name: 'Metode Pembayaran', href: '/payment-methods' },
    { name: 'Syarat & Ketentuan', href: '/terms' },
    { name: 'Kebijakan Privasi', href: '/privacy' },
  ],
  support: [
    { name: 'Pusat Bantuan', href: '/help' },
    { name: 'Cek Pesanan', href: '/check-order' },
    { name: 'Kontak Kami', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
  ],
  company: [
    { name: 'Tentang Kami', href: '/about' },
    { name: 'Karir', href: '/careers' },
    { name: 'Blog', href: '/blog' },
    { name: 'Media', href: '/press' },
  ],
}

const socialLinks = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'YouTube', href: '#', icon: Youtube },
]

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="flex items-center space-x-2" aria-label="NEXATOPUP Home">
              <Gamepad2 className="h-10 w-10 text-purple-500" aria-hidden="true" />
              <span className="text-2xl font-bold text-slate-50">NEXATOPUP</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Platform top-up game terpercaya di Indonesia. Aman, cepat, dan terjangkau.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-slate-400 hover:text-purple-400 transition-colors"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-50">Produk</h3>
                <ul className="mt-4 space-y-3">
                  {footerLinks.product.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="text-sm text-slate-400 hover:text-purple-400 transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-slate-50">Dukungan</h3>
                <ul className="mt-4 space-y-3">
                  {footerLinks.support.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="text-sm text-slate-400 hover:text-purple-400 transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-slate-50">Perusahaan</h3>
                <ul className="mt-4 space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="text-sm text-slate-400 hover:text-purple-400 transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-slate-50">Kontak</h3>
                <ul className="mt-4 space-y-3">
                  <li className="flex items-center space-x-3 text-sm text-slate-400">
                    <Mail className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span>support@nexatopup.com</span>
                  </li>
                  <li className="flex items-center space-x-3 text-sm text-slate-400">
                    <Phone className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span>+62 21 1234 5678</span>
                  </li>
                  <li className="flex items-center space-x-3 text-sm text-slate-400">
                    <MapPin className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    <span>Jakarta, Indonesia</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 bg-slate-950/50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} NEXATOPUP. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}