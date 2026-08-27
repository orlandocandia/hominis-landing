import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// PATCH /api/admin/empresas/[id] — update empresa
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const body = await request.json().catch(() => ({}))

    const updated = await db.empresa.update({
      where: { id },
      data: {
        ...(body.nombre && { nombre: body.nombre }),
        ...(body.email && { email: body.email }),
        ...(body.telefono !== undefined && { telefono: body.telefono }),
        ...(body.direccion !== undefined && { direccion: body.direccion }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error en PATCH /api/admin/empresas/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE /api/admin/empresas/[id] — delete empresa
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    await db.empresa.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error en DELETE /api/admin/empresas/[id]:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
