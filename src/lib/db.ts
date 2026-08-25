import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Detectar si estamos en un entorno de build (production sin DATABASE_URL).
// En Vercel, durante `next build`, las env vars pueden no estar disponibles
// aún. Si creamos un PrismaClient con URL undefined → URL_INVALID.
const isBuild = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL

function createPrismaClient(): PrismaClient {
  // Build mode: usar SQLite dummy (no se ejecuta realmente, solo para que
  // PrismaClient no lance error al instanciarse).
  if (isBuild) {
    console.log('[DB] Build mode: usando PrismaClient dummy (sin conexión real)')
    return new PrismaClient({
      datasourceUrl: 'file:./prisma/dev.db',
      log: ['error'],
    })
  }

  const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'

  // If using Turso (libsql://), use the libSQL adapter
  if (databaseUrl.startsWith('libsql://') || databaseUrl.startsWith('libsql:')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaLibSql } = require('@prisma/adapter-libsql')
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createClient } = require('@libsql/client')

      const libsql = createClient({
        url: databaseUrl,
        authToken: process.env.TURSO_AUTH_TOKEN || undefined,
      })
      const adapter = new PrismaLibSql(libsql)
      return new PrismaClient({ adapter, log: ['error', 'warn'] })
    } catch (e) {
      console.error('[DB] Failed to load libSQL adapter, falling back to standard PrismaClient:', e)
    }
  }

  // Default: standard SQLite PrismaClient (local development)
  return new PrismaClient({ log: ['error', 'warn'] })
}

// Lazy initialization: only create the PrismaClient when db is first accessed.
// Combined with isBuild check, this ensures no URL_INVALID during Vercel build.
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient()
    }
    const value = (globalForPrisma.prisma as any)[prop]
    return typeof value === 'function' ? value.bind(globalForPrisma.prisma) : value
  },
})
