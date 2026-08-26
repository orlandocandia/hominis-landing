// Auth helpers — single source of truth for session management.
import { getServerSession } from 'next-auth'
import { authOptions } from './config'

/**
 * Get the current user's session (or null if not authenticated).
 * Uses getServerSession with authOptions from config.ts.
 */
export async function getAuthSession() {
  return getServerSession(authOptions)
}

/**
 * Require authentication — throws redirect to /login if not authenticated.
 * Returns the session with user.id and user.role.
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return null
  }
  return session
}

/**
 * Require a specific role — returns null if not authenticated or wrong role.
 * Usage in API routes:
 *   const session = await requireRole('ADMIN')
 *   if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 */
export async function requireRole(role: 'ADMIN' | 'VENDEDOR') {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== role) {
    return null
  }
  return session
}
