import { getServerSession } from 'next-auth'
import { authOptions } from './config'

/**
 * Get the current session (or null if not authenticated).
 */
export async function getAuthSession() {
  return getServerSession(authOptions)
}

/**
 * Require authentication. Returns the session or null.
 * Use in API routes:
 *   const session = await requireAuth()
 *   if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  return session
}

/**
 * Require a specific role. Returns the session or null.
 * Use in API routes:
 *   const session = await requireRole('ADMIN')
 *   if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 */
export async function requireRole(role: 'ADMIN' | 'VENDEDOR') {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== role) return null
  return session
}
