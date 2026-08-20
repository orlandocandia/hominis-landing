import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/admin/stats/equipo
// Returns aggregate totals for the team control panel
export async function GET() {
  try {
    const [totalVendedores, totalLeads, totalTareas] = await Promise.all([
      db.user.count({ where: { rol: 'VENDEDOR', activo: true } }),
      // totalLeads = leads de la landing publica (tabla Contacto, legacy).
      db.contacto.count(),
      db.tarea.count({
        where: { estado: { in: ['PENDIENTE', 'EN_PROGRESO'] } },
      }),
    ])

    return NextResponse.json({
      totalVendedores,
      totalLeads,
      totalTareas,
    })
  } catch (error) {
    console.error('Error en stats equipo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
