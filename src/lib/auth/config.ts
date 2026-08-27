import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

/**
 * NextAuth configuration — single source of truth.
 *
 * Uses CredentialsProvider with bcrypt password verification against the
 * User table in the database (Turso/SQLite via Prisma).
 *
 * Includes a hardcoded admin fallback for when the DB is unreachable
 * (eg. during build or if DATABASE_URL is not configured).
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH] Login attempt:', credentials?.email)

        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // --- HARDCODED ADMIN FALLBACK ---
        // Works without DB. Remove when DB is stable in production.
        if (credentials.email === 'admin@hominis.com' && credentials.password === 'Hominis2025!') {
          console.log('[AUTH] ✅ Hardcoded admin')
          return {
            id: 'admin-hardcodeado',
            email: 'admin@hominis.com',
            name: 'Administrador',
            role: 'ADMIN',
          }
        }

        // --- DATABASE LOOKUP ---
        try {
          const user = await db.user.findFirst({
            where: { email: credentials.email, activo: true },
            select: {
              id: true,
              email: true,
              nombre: true,
              apellido: true,
              rol: true,
              password: true,
            },
          })

          if (!user) {
            console.log('[AUTH] ❌ User not found')
            return null
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          if (!isValid) {
            console.log('[AUTH] ❌ Wrong password')
            return null
          }

          console.log('[AUTH] ✅ DB user:', user.email, '| rol:', user.rol)
          return {
            id: user.id,
            email: user.email,
            name: `${user.nombre} ${user.apellido || ''}`.trim(),
            role: user.rol,
          }
        } catch (dbErr) {
          console.error('[AUTH] DB error:', dbErr)
          return null
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session?.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-dev-secret-do-not-use-in-production',
}
