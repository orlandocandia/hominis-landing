import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const lead = await db.contact.findUnique({ where: { id } })

    if (!lead) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })
    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error en GET /api/admin/leads/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const body = await request.json().catch(() => ({}))

    const updated = await db.contact.update({
      where: { id },
      data: { ...(body.status && { status: body.status }) },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error en PATCH /api/admin/leads/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
