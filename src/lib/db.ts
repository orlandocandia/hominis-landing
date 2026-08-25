import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || ''
  
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

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
