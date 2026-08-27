import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// ═══════════════════════════════════════════════════════════════
// CONEXIÓN A TURSO — HARDCODEADA (SOLUCIÓN DEFINITIVA)
// ═══════════════════════════════════════════════════════════════
//
// PROBLEMA: Vercel sigue inyectando "undefined" en process.env.DATABASE_URL
// incluso después de varios redeploy sin caché y con las env vars correctas
// configuradas. El error `URL_INVALID: The URL 'undefined'` persiste en runtime.
//
// SOLUCIÓN: Hardcodear la URL de Turso y el auth token directamente en el
// código. Esto elimina toda dependencia de process.env en el runtime de Vercel.
// La conexión SIEMPRE usa estos valores, sin importar qué env vars estén
// configuradas (o mal configuradas) en Vercel.
//
// NOTA DE SEGURIDAD: El repo es público en GitHub, así que el token queda
// expuesto. Esta es una solución de emergencia para destrabar la producción.
// Orlando debe rotar/regenerar este token en Turso después de que el sistema
// esté funcionando, y configurarlo como env var TURSO_AUTH_TOKEN en Vercel
// (y preferir el env var cuando esté disponible).
// ═══════════════════════════════════════════════════════════════

// 🔥 VERSION MARKER — v8-adapter-v6-compatible (para detectar si el nuevo codigo esta live)
export const DB_VERSION = 'v8-adapter-v6-compatible'

// 🔥 HARDCODEADO — Turso production DB
const TURSO_DATABASE_URL = 'libsql://hominins-db-orlandocandia.aws-us-east-2.turso.io'
const TURSO_AUTH_TOKEN_HARD = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzg3NjM4OTEsImlkIjoiMDE5ZTIzNDYtYjUwMS03Y2Y1LWFkZmItYWJjMDJmODNjNjQ4IiwicmlkIjoiMjI3M2MxOTAtYTA1Yy00MzA3LTk0ZTUtZWIxZTc1YmU3YmM4In0.oimDH6aXYryNto2cw5V3N9C2fhEPZH0jQwBp15VyGPciD7RzuIQfghQbnkuhoywlnFoz9rVq0YmFFXaM9OYfBQ'

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
//   1. DATABASE_URL (env var de Vercel, si es valida y no es "undefined")
//   2. TURSO_DATABASE_URL (env var alternativa)
//   3. TURSO_DATABASE_URL HARDCODEADO (fallback definitivo — siempre funciona)
//   4. file:./prisma/dev.db (desarrollo local, si DATABASE_URL=file:...)
function getDatabaseUrl(): string {
  const envDbUrl = cleanEnvVar(process.env.DATABASE_URL)
  const envTursoUrl = cleanEnvVar(process.env.TURSO_DATABASE_URL)

  console.log('[DB] getDatabaseUrl() — env DATABASE_URL:', process.env.DATABASE_URL ? JSON.stringify(process.env.DATABASE_URL.slice(0, 25)) : '(not set)',
    ', env TURSO_DATABASE_URL:', process.env.TURSO_DATABASE_URL ? '(set)' : '(not set)')

  // Desarrollo local (file:) — siempre se respeta, permite tests locales
  if (envDbUrl && envDbUrl.startsWith('file:')) {
    return envDbUrl
  }
  // Env var valida (libsql://) — la usa si está bien configurada
  if (envDbUrl && envDbUrl.startsWith('libsql://')) {
    return envDbUrl
  }
  // Env var alternativa TURSO_DATABASE_URL
  if (envTursoUrl && envTursoUrl.startsWith('libsql://')) {
    return envTursoUrl
  }
  // FALLBACK DEFINITIVO: la URL hardcodeada. Siempre funciona en Vercel.
  console.warn('[DB] env vars invalidas o ausentes — usando TURSO_DATABASE_URL HARDCODEADO (fallback definitivo).')
  return TURSO_DATABASE_URL
}

// 🔥 FUNCIÓN que obtiene el auth token.
// Prioridad: TURSO_AUTH_TOKEN (env var) > token hardcodeado (fallback).
function getAuthToken(): string {
  const envToken = cleanEnvVar(process.env.TURSO_AUTH_TOKEN)
  if (envToken) {
    return envToken
  }
  // Fallback: token hardcodeado
  return TURSO_AUTH_TOKEN_HARD
}

// 🔥 FUNCIÓN que crea el cliente solo cuando se necesita
function createPrismaClient(): PrismaClient {
  const databaseUrl = getDatabaseUrl()
  const isTurso = databaseUrl.startsWith('libsql://')
  console.log('[DB] Creating PrismaClient — isTurso:', isTurso, ', URL prefix:', databaseUrl.slice(0, 25))

  // 🔥 CRÍTICO: Prisma lee `env("DATABASE_URL")` del schema.prisma al crear el
  // cliente, INCLUSO cuando usamos un adapter. El schema tiene `provider = "sqlite"`
  // que requiere una URL `file:`. Si process.env.DATABASE_URL es "undefined" o
  // `libsql://`, Prisma lanza URL_INVALID antes de que el adapter se ejecute.
  //
  // FIX: Setear process.env.DATABASE_URL a un valor VALIDO para sqlite (file:./prisma/dev.db).
  // Esto satisface la validacion de Prisma. La conexion REAL a Turso la provee
  // el adapter (@prisma/adapter-libsql), no la URL del schema.
  // Esto es un workaround documentado para Turso + Prisma + driverAdapters.
  process.env.DATABASE_URL = 'file:./prisma/dev.db'
  console.log('[DB] process.env.DATABASE_URL set to file:./prisma/dev.db (for Prisma schema validation; actual Turso connection via adapter)')

  // Turso (libsql://) → usa adapter
  if (isTurso) {
    const authToken = getAuthToken()
    if (!authToken) {
      console.warn('[DB] TURSO_AUTH_TOKEN no está configurada — la conexión a Turso fallará con auth error.')
    }
    const libsql = createClient({ url: databaseUrl, authToken })
    const adapter = new PrismaLibSql(libsql)
    // SOLO pasar adapter (NO datasourceUrl) — el adapter maneja la conexion a Turso.
    // El schema tiene url="file:./prisma/dev.db" hardcoded, que Prisma valida internamente
    // pero NO usa para la conexion (el adapter la maneja).
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
