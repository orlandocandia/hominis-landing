import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql, getLibsqlClient } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/notifications -> list notifications for the authenticated user
// FLUJO: intenta Prisma primero; si falla, usa fallback libsql.
export async function GET() {
  try {
    const session = await requireAuth()
    if (!session?.user) {
      return NextResponse.json([])
    }

    const userId = (session.user as any).id as string

    // === INTENTO 1: Prisma ===
    try {
      const notifications = await db.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      })

      return NextResponse.json(notifications)
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[notifications] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      const notifications = await queryLibsql(
        'SELECT id, userId, type, title, message, read, link, createdAt FROM Notification WHERE userId = ? ORDER BY createdAt DESC LIMIT 30',
        [userId]
      )

      // Convertir fechas y read (0/1 → boolean) para consistencia con Prisma
      const notificationsFormatted = notifications.map((n: any) => ({
        ...n,
        read: n.read === 1 || n.read === true,
        createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : null,
      }))

      return NextResponse.json(notificationsFormatted)
    }
  } catch (error) {
    console.error('Error en GET /api/notifications:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications { readAll: true } -> mark all as read
// FLUJO: intenta Prisma primero; si falla, usa fallback libsql.
export async function PATCH(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id as string
    const body = await request.json().catch(() => ({}))

    if (body?.readAll) {
      // === INTENTO 1: Prisma ===
      try {
        await db.notification.updateMany({
          where: { userId, read: false },
          data: { read: true },
        })
        return NextResponse.json({ success: true })
      } catch (prismaErr) {
        // Fallback: libsql directo
        console.warn('[notifications PATCH] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))
        const client = getLibsqlClient()
        await client.execute({
          sql: 'UPDATE Notification SET read = 1 WHERE userId = ? AND read = 0',
          args: [userId],
        })
        return NextResponse.json({ success: true })
      }
    }

    return NextResponse.json(
      { error: 'Operación no soportada' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error en PATCH /api/notifications:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
