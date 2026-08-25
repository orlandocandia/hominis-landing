import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
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
// This prevents PrismaClient from being instantiated during the build (when
// DATABASE_URL may not be available), which would cause URL_INVALID errors.
// The Proxy defers createPrismaClient() to the first property access.
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient()
    }
    const value = (globalForPrisma.prisma as any)[prop]
    return typeof value === 'function' ? value.bind(globalForPrisma.prisma) : value
  },
})
