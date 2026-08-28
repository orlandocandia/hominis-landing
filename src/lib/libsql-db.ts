import { createClient as createLibsqlClient, type Client } from '@libsql/client'

// ═══════════════════════════════════════════════════════════════
// CLIENTE LIBSQL DIRECTO — BYPASS DEL ENGINE DE PRISMA
// ═══════════════════════════════════════════════════════════════
//
// PROBLEMA: El engine Rust de Prisma lee process.env.DATABASE_URL en el
// cold start del Lambda de Vercel, ANTES de que JavaScript corra. Vercel
// inyecta "undefined" como valor, lo que causa URL_INVALID en Prisma.
// No se puede fixear desde JavaScript porque el engine ya leyo el env.
//
// SOLUCION: Usar @libsql/client directamente para leer/escribir en Turso
// con SQL crudo. Esto bypassa completamente el engine de Prisma.
//
// Este modulo exporta un cliente libsql singleton que todas las APIs
// admin pueden usar como fallback cuando Prisma falla.
// ═══════════════════════════════════════════════════════════════

// 🔥 HARDCODEADO — Turso production DB (mismo token que en db.ts y route.ts)
const TURSO_DATABASE_URL = 'libsql://hominins-db-orlandocandia.aws-us-east-2.turso.io'
const TURSO_AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzg3NjM4OTEsImlkIjoiMDE5ZTIzNDYtYjUwMS03Y2Y1LWFkZmItYWJjMDJmODNjNjQ4IiwicmlkIjoiMjI3M2MxOTAtYTA1Yy00MzA3LTk0ZTUtZWIxZTc1YmU3YmM4In0.oimDH6aXYryNto2cw5V3N9C2fhEPZH0jQwBp15VyGPciD7RzuIQfghQbnkuhoywlnFoz9rVq0YmFFXaM9OYfBQ'

// Singleton: crear el cliente una sola vez y reusarlo en todas las invocaciones
let libsqlClient: Client | null = null

/**
 * Obtener el cliente libsql singleton conectado a Turso.
 * El cliente se crea una sola vez (lazy init) y se reusa.
 */
export function getLibsqlClient(): Client {
  if (!libsqlClient) {
    libsqlClient = createLibsqlClient({
      url: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN,
    })
  }
  return libsqlClient
}

/**
 * Ejecutar una consulta SQL y devolver las filas como array de objetos.
 * Helper para simplificar el fallback en las APIs admin.
 *
 * Ejemplo:
 *   const users = await queryLibsql('SELECT id, email FROM User WHERE rol = ?', ['ADMIN'])
 *   // users: [{ id: '...', email: '...' }, ...]
 */
export async function queryLibsql<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  const client = getLibsqlClient()
  const result = await client.execute({ sql, args })
  return result.rows.map((row) => {
    const obj: Record<string, any> = {}
    result.columns.forEach((col, i) => {
      const cell = row[i]
      obj[col] = cell === null ? null : (typeof cell === 'object' && 'value' in cell ? (cell as any).value : cell)
    })
    return obj as T
  })
}

/**
 * Ejecutar una consulta y devolver un solo valor (COUNT, MAX, etc.).
 */
export async function scalarLibsql(sql: string, args: any[] = []): Promise<number> {
  const client = getLibsqlClient()
  const result = await client.execute({ sql, args })
  if (result.rows.length === 0) return 0
  const cell = result.rows[0][0]
  if (cell === null) return 0
  const value = typeof cell === 'object' && 'value' in cell ? (cell as any).value : cell
  return Number(value) || 0
}

/**
 * Ejecutar una sentencia INSERT/UPDATE/DELETE y devolver la cantidad de filas afectadas.
 * Helper para operaciones de escritura en las APIs admin.
 *
 * NOTA: @libsql/client devuelve `rowsAffected` (camelCase), NO `rows_affected` (snake_case).
 *
 * Ejemplo:
 *   const affected = await executeLibsql('UPDATE Contact SET status = ? WHERE id = ?', ['LEIDO', 'abc123'])
 *   // affected: 1 (una fila actualizada)
 */
export async function executeLibsql(sql: string, args: any[] = []): Promise<number> {
  const client = getLibsqlClient()
  const result = await client.execute({ sql, args })
  // @libsql/client usa rowsAffected (camelCase)
  return (result as any).rowsAffected || (result as any).rows_affected || 0
}

/**
 * Ejecutar un batch de sentencias INSERT/UPDATE/DELETE en una transaccion.
 * Todas se ejecutan o ninguna (atomicidad).
 *
 * Ejemplo:
 *   await batchLibsql([
 *     { sql: 'UPDATE Contact SET status = ?', args: ['LEIDO'] },
 *     { sql: 'INSERT INTO ContactActivity ...', args: [...] },
 *   ])
 */
export async function batchLibsql(statements: { sql: string; args: any[] }[]): Promise<void> {
  const client = getLibsqlClient()
  await client.batch(statements.map((s) => ({ sql: s.sql, args: s.args })))
}
