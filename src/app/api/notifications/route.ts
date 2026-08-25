import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getDemoUserId } from '@/lib/demo-user'

export const dynamic = 'force-dynamic'

// GET /api/notifications  -> list notifications for the current (demo admin) user
export async function GET() {
  try {
    const userId = await getDemoUserId()
    if (!userId) {
      return NextResponse.json([])
    }

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error en GET /api/notifications:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications  { readAll: true }  -> mark all as read
export async function PATCH(request: Request) {
  try {
    const userId = await getDemoUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))

    if (body?.readAll) {
      await db.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      })
      return NextResponse.json({ success: true })
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
