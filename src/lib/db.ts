import { PrismaClient } from '@prisma/client'

console.log('[DB] Inicializando PrismaClient en runtime...')
console.log('[DB] DATABASE_URL exists?', !!process.env.DATABASE_URL)
console.log('[DB] DATABASE_URL value:', process.env.DATABASE_URL)

// Obtener la URL de la base de datos con fallback a SQLite local
const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db'
console.log('[DB] Using URL:', databaseUrl)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: databaseUrl,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
