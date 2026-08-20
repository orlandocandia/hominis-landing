import { db } from '@/lib/db'

/**
 * Demo helper: returns the admin user id used as the "current user"
 * for the panel + notifications in this self-contained demo.
 * In a full deployment this would be replaced by the NextAuth session user.
 */
export async function getDemoUserId(): Promise<string | null> {
  const admin = await db.user.findFirst({
    where: { rol: 'ADMIN' },
    select: { id: true },
  })
  return admin?.id ?? null
}
