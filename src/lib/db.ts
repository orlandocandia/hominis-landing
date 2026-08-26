import { PrismaClient } from '@prisma/client'

console.log('[DB] Inicializando PrismaClient en runtime...')
console.log('[DB] DATABASE_URL exists?', !!process.env.DATABASE_URL)
console.log('[DB] DATABASE_URL value:', process.env.DATABASE_URL)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db'
  console.log('[DB] Using URL:', databaseUrl)

  // Si la URL es de Turso (libsql://), usar el adapter de libSQL
  if (databaseUrl.startsWith('libsql://') || databaseUrl.startsWith('libsql:')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaLibSql } = require('@prisma/adapter-libsql')
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createClient } = require('@libsql/client')

      console.log('[DB] Usando Turso (libSQL adapter)')
      const libsql = createClient({
        url: databaseUrl,
        authToken: process.env.TURSO_AUTH_TOKEN || undefined,
      })
      const adapter = new PrismaLibSql(libsql)
      return new PrismaClient({ adapter, log: ['error', 'warn'] })
    } catch (e) {
      console.error('[DB] Error cargando libSQL adapter, fallback a SQLite:', e)
    }
  }

  // SQLite local (desarrollo) o fallback
  console.log('[DB] Usando SQLite estandar')
  return new PrismaClient({ datasourceUrl: databaseUrl, log: ['error', 'warn'] })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
