import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user
  const pathname = req.nextUrl.pathname
  const isOnAdmin = pathname.startsWith('/admin')
  const isOnAdminLogin = pathname === '/admin/login'

  const user = req.auth?.user
  const isAdmin =
    user?.accountType === 'ADMIN' &&
    ['ADMIN', 'SUPER_ADMIN'].includes(user.role)

  if (isOnAdmin) {
    if (isOnAdminLogin) {
      if (isLoggedIn && isAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl))
      }
      return NextResponse.next()
    }

    if (!isLoggedIn || !isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', req.nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/customer/orders/:path*',
    '/api/customer/payment/:path*',
  ],
}
