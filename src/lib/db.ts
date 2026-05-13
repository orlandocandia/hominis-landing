import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl = process.env.DATABASE_URL || ''

// For Turso (Vercel production): load the Turso adapter dynamically
// For local dev: use simple SQLite PrismaClient
if (databaseUrl.startsWith('libsql://') && !globalForPrisma.prisma) {
  // In production (Vercel), import the Turso adapter
  import('./db-turso').then(({ createTursoClient }) => {
    globalForPrisma.prisma = createTursoClient()
  }).catch((err) => {
    console.error('Failed to connect to Turso:', err)
    // Fallback to SQLite
    globalForPrisma.prisma = new PrismaClient({ log: ['query'] })
  })
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({ log: ['query'] })
}

export const db = globalForPrisma.prisma
