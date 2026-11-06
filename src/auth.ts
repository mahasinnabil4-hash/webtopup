import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db/prisma'
import { comparePassword } from '@/lib/utils/crypto'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (
          typeof credentials?.email !== 'string' ||
          typeof credentials?.password !== 'string'
        ) {
          return null
        }

        const email = credentials.email.trim().toLowerCase()
        const password = credentials.password

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (user?.isActive) {
          const valid = await comparePassword(password, user.passwordHash)

          if (valid) {
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            })

            return {
              id: user.id,
              email: user.email,
              name: user.fullName,
              role: user.role,
              accountType: 'CUSTOMER',
            }
          }
        }

        const admin = await prisma.admin.findUnique({
          where: { email },
        })

        if (!admin?.isActive) return null

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
          accountType: 'ADMIN',
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
        session.user.accountType = token.accountType as 'CUSTOMER' | 'ADMIN'
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
})
