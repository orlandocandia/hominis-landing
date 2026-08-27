import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// Filtra valores invalidos comunes en env vars de Vercel.
// A veces Vercel tiene DATABASE_URL seteada al literal "undefined" o "null"
// (misconfiguracion), lo que causa URL_INVALID en Prisma. Filtramos esos casos.
function cleanEnvVar(value: string | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return null
  return trimmed
}

// 🔥 FUNCIÓN que obtiene la URL solo cuando se llama.
// Cadena de prioridad:
//   1. DATABASE_URL (si es valida y no es "undefined")
//   2. TURSO_DATABASE_URL (fallback, util si DATABASE_URL esta mal configurada)
function getDatabaseUrl(): string {
  const dbUrl = cleanEnvVar(process.env.DATABASE_URL)
  const tursoUrl = cleanEnvVar(process.env.TURSO_DATABASE_URL)

  console.log('[DB] getDatabaseUrl() called —',
    'DATABASE_URL:', process.env.DATABASE_URL ? JSON.stringify(process.env.DATABASE_URL.slice(0, 30)) : '(not set)',
    ', TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL ? '(set)' : '(not set)',
    ', cleaned dbUrl:', dbUrl ? dbUrl.slice(0, 30) + '...' : 'null',
    ', cleaned tursoUrl:', tursoUrl ? tursoUrl.slice(0, 30) + '...' : 'null'
  )

  // Preferir Turso URL si esta disponible (mas especifica)
  if (tursoUrl && tursoUrl.startsWith('libsql://')) {
    return tursoUrl
  }
  // Usar DATABASE_URL si es valida
  if (dbUrl) {
    return dbUrl
  }
  // Ninguna URL valida
  throw new Error(
    '[DB] CRITICAL: DATABASE_URL no está configurada correctamente. ' +
    'Valor actual de DATABASE_URL: ' + JSON.stringify(process.env.DATABASE_URL) + '. ' +
    'Setear en Vercel → Settings → Environment Variables: ' +
    'DATABASE_URL=libsql://hominins-db-orlandocandia.aws-us-east-2.turso.io ' +
    'y TURSO_AUTH_TOKEN=<token>. ' +
    'Tambien se acepta TURSO_DATABASE_URL como fallback.'
  )
}

// 🔥 FUNCIÓN que crea el cliente solo cuando se necesita
function createPrismaClient(): PrismaClient {
  const databaseUrl = getDatabaseUrl()
  const isTurso = databaseUrl.startsWith('libsql://')
  console.log('[DB] Creating PrismaClient — isTurso:', isTurso, ', URL prefix:', databaseUrl.slice(0, 25))

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
