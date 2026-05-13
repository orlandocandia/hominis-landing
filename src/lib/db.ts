import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || ''
  const authToken = process.env.DATABASE_AUTH_TOKEN || ''

  // If using Turso/libSQL (cloud database for Vercel)
  if (databaseUrl.startsWith('libsql://')) {
    const libsql = createClient({
      url: databaseUrl,
      authToken: authToken,
    })
    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter, log: ['query'] })
  }

  // Local SQLite (development)
  return new PrismaClient({ log: ['query'] })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
