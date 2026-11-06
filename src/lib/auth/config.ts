import { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db/prisma'
import { comparePassword, hashPassword } from '@/lib/utils/crypto'

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (
          typeof credentials?.email !== 'string' ||
          typeof credentials?.password !== 'string'
        ) {
          return null
        }

        const email = credentials.email
        const password = credentials.password

        // Admin diperiksa terlebih dahulu karena tabel Admin terpisah.
        const admin = await prisma.admin.findUnique({
          where: { email },
        })

        if (admin) {
          if (!admin.isActive) return null

          const valid = await comparePassword(password, admin.passwordHash)
          if (!valid) return null

          await prisma.admin.update({
            where: { id: admin.id },
            data: { lastLoginAt: new Date() },
          })

          return {
            id: admin.id,
            email: admin.email,
            name: admin.fullName,
            role: admin.role,
            accountType: 'ADMIN' as const,
          }
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.isActive) return null

        const valid = await comparePassword(password, user.passwordHash)
        if (!valid) return null

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          accountType: 'CUSTOMER' as const,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.accountType = user.accountType
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.accountType = token.accountType as 'ADMIN' | 'CUSTOMER'
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
}

export async function registerUser(data: {
  email: string
  password: string
  fullName?: string
  phone?: string
}) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existing) {
    throw new Error('Email already registered')
  }

  if (data.phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone: data.phone },
    })
    if (existingPhone) {
      throw new Error('Phone number already registered')
    }
  }

  const passwordHash = await hashPassword(data.password)

  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      phone: data.phone,
      role: 'USER',
    },
  })
}

export async function createAdminUser(data: {
  email: string
  password: string
  fullName: string
  role?: 'ADMIN' | 'SUPER_ADMIN'
}) {
  const existing = await prisma.admin.findUnique({
    where: { email: data.email },
  })

  if (existing) {
    throw new Error('Admin email already exists')
  }

  const passwordHash = await hashPassword(data.password)

  return prisma.admin.create({
    data: {
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      role: data.role || 'ADMIN',
    },
  })
}