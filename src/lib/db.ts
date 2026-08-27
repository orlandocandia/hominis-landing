import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// 🔥 FUNCIÓN que obtiene la URL solo cuando se llama.
// Intenta varias env vars (DATABASE_URL, TURSO_DATABASE_URL) para robustez
// en Vercel, donde a veces el nombre del env var varia.
function getDatabaseUrl(): string {
  // Prioridad: DATABASE_URL > TURSO_DATABASE_URL
  const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL
  console.log('[DB] getDatabaseUrl() called, DATABASE_URL exists?', !!process.env.DATABASE_URL, ', TURSO_DATABASE_URL exists?', !!process.env.TURSO_DATABASE_URL)
  if (!url) {
    throw new Error(
      '[DB] CRITICAL: DATABASE_URL no está configurada. ' +
      'Setear en .env (local) o en Vercel → Settings → Environment Variables (producción). ' +
      'Formato: libsql://<tu-db>.turso.io (Turso) o file:./prisma/dev.db (SQLite local). ' +
      'Tambien se acepta TURSO_DATABASE_URL como fallback.'
    )
  }
  return url
}

// 🔥 FUNCIÓN que crea el cliente solo cuando se necesita
function createPrismaClient(): PrismaClient {
  const databaseUrl = getDatabaseUrl()
  const isTurso = databaseUrl.startsWith('libsql://')
  console.log('[DB] Creating PrismaClient with URL:', databaseUrl.slice(0, 40) + '...', 'isTurso:', isTurso)

  // Turso (libsql://) → usa adapter
  if (isTurso) {
    const authToken = process.env.TURSO_AUTH_TOKEN || ''
    if (!authToken) {
      console.warn('[DB] TURSO_AUTH_TOKEN no está configurada — la conexión a Turso fallará con auth error.')
    }
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
