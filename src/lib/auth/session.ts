import { auth } from '@/auth'
import { prisma } from '@/lib/db/prisma'

export async function getSession() {
  return auth()
}

export async function getCurrentUser() {
  const session = await auth()

  if (!session?.user || session.user.accountType !== 'CUSTOMER') {
    return null
  }

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      avatar: true,
      role: true,
      isActive: true,
    },
  })
}

export async function requireAuth() {
  const session = await auth()

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  return session.user
}

export async function requireAdmin() {
  const session = await auth()

  if (
    !session?.user ||
    session.user.accountType !== 'ADMIN' ||
    !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
  ) {
    throw new Error('Forbidden: Admin access required')
  }

  return session.user
}

export async function requireSuperAdmin() {
  const session = await auth()

  if (
    !session?.user ||
    session.user.accountType !== 'ADMIN' ||
    session.user.role !== 'SUPER_ADMIN'
  ) {
    throw new Error('Forbidden: Super admin access required')
  }

  return session.user
}
