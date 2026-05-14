import { PrismaClient } from '@prisma/client'
import { getTursoUrl, getTursoAuthToken } from './turso-config'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Get credentials from centralized config (env vars first, then hardcoded fallback)
  const tursoUrl = getTursoUrl()
  const tursoToken = getTursoAuthToken()

  if (tursoUrl.startsWith('libsql://')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaLibSql } = require('@prisma/adapter-libsql')
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createClient } = require('@libsql/client')

      console.log('[DB] Using Turso (libSQL) adapter')
      const libsql = createClient({
        url: tursoUrl,
        authToken: tursoToken,
      })

      const adapter = new PrismaLibSql(libsql)
      return new PrismaClient({ adapter })
    } catch (error) {
      console.error('[DB] Turso adapter failed, falling back to SQLite:', error)
      return new PrismaClient({ log: ['query'] })
    }
  }

  // Local development: use simple SQLite PrismaClient
  console.log('[DB] Using SQLite (local)')
  return new PrismaClient({ log: ['query'] })
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = createPrismaClient()
}

export const db = globalForPrisma.prisma
