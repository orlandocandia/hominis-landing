import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getDemoUserId } from '@/lib/demo-user'

export const dynamic = 'force-dynamic'

// PATCH /api/notifications/[id]  { read: true }  -> mark one as read
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getDemoUserId()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))

    // Make sure the notification belongs to the user
    const notif = await db.notification.findUnique({ where: { id } })
    if (!notif || notif.userId !== userId) {
      return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
    }

    const updated = await db.notification.update({
      where: { id },
      data: { read: body?.read ?? true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error en PATCH /api/notifications/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
