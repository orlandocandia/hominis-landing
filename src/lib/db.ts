import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// 🔥 FUNCIÓN que obtiene la URL solo cuando se llama
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  console.log('[DB] getDatabaseUrl() called, DATABASE_URL exists?', !!url)
  if (!url) {
    throw new Error(
      '[DB] CRITICAL: DATABASE_URL no está configurada. ' +
      'Setear en .env (local) o en Vercel → Settings → Environment Variables (producción). ' +
      'Formato: libsql://<tu-db>.turso.io (Turso) o file:./prisma/dev.db (SQLite local)'
    )
  }
  return url
}

// 🔥 FUNCIÓN que crea el cliente solo cuando se necesita
function createPrismaClient(): PrismaClient {
  const databaseUrl = getDatabaseUrl()
  console.log('[DB] Creating PrismaClient with URL:', databaseUrl)

  // Turso (libsql://) → usa adapter
  if (databaseUrl.startsWith('libsql://')) {
    const authToken = process.env.TURSO_AUTH_TOKEN || ''
    const libsql = createClient({ url: databaseUrl, authToken })
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({ adapter })
  }

  // Local (file:) → SQLite estándar
  return new PrismaClient({ datasourceUrl: databaseUrl })
}

// 🔥 LAZY initialization: solo se crea cuando se accede a `db`
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient()
    }
    const value = (globalForPrisma.prisma as any)[prop]
    return typeof value === 'function' ? value.bind(globalForPrisma.prisma) : value
  },
})
