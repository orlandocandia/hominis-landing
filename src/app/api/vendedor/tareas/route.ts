import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const userId = (session.user as any).id as string
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado') || ''

    const where: any = { asignadoA: userId }
    if (estado) where.estado = estado

    const tareas = await db.tarea.findMany({
      where,
      orderBy: { fechaLimite: 'asc' },
    })

    return NextResponse.json({ tareas, total: tareas.length })
  } catch (error) {
    console.error('Error en GET /api/vendedor/tareas:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
