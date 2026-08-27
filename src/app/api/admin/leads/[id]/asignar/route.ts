import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/admin/leads/[id]/asignar — asignar lead a un vendedor (crea tarea)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const userId = (session.user as any).id as string

    if (!body.asignadoA) {
      return NextResponse.json({ error: 'Falta asignadoA' }, { status: 400 })
    }

    // Create a task for the vendedor
    const tarea = await db.tarea.create({
      data: {
        titulo: `Contactar a lead: ${body.leadName || id}`,
        descripcion: body.comentario || `Lead asignado desde el panel admin.`,
        tipo: 'LLAMADA',
        estado: 'PENDIENTE',
        fechaLimite: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        asignadoA: body.asignadoA,
        asignadoPor: userId,
        contactoId: id,
      },
    })

    // Update lead status
    await db.contact.update({
      where: { id },
      data: { status: 'EN_CONTACTO' },
    })

    return NextResponse.json({ ok: true, tarea }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/admin/leads/[id]/asignar:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
