import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const userId = (session.user as any).id as string
    const { id } = await params
    const body = await request.json().catch(() => ({}))

    // Verify ownership
    const lead = await db.contact.findUnique({ where: { id } })
    if (!lead || lead.ownerId !== userId) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    const updated = await db.contact.update({
      where: { id },
      data: { ...(body.status && { status: body.status }) },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error en PATCH /api/vendedor/leads/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
