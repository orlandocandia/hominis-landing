// Turso Database Client - Only used in Vercel production
// This file is imported dynamically to avoid Turbopack issues in development
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

export function createTursoClient() {
  const databaseUrl = process.env.DATABASE_URL || ''
  const authToken = process.env.DATABASE_AUTH_TOKEN || ''

  const libsql = createClient({
    url: databaseUrl,
    authToken: authToken,
  })

  const adapter = new PrismaLibSql(libsql)
  return new PrismaClient({ adapter, log: ['query'] })
}
