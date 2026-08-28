import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/admin/users/[id]/leads — obtener leads asignados a un vendedor
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params

    // === INTENTO 1: Prisma ===
    try {
      const leads = await db.contact.findMany({
        where: { ownerId: id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, primaryEmail: true, primaryPhone: true,
          message: true, status: true, sourceReferrer: true,
          lastContact: true, createdAt: true,
        },
        take: 50,
      })
      return NextResponse.json(leads)
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[admin/users/[id]/leads] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      const leads = await queryLibsql(
        `SELECT id, name, primaryEmail, primaryPhone, message, status, sourceReferrer, lastContact, createdAt
         FROM Contact WHERE ownerId = ?
         ORDER BY createdAt DESC
         LIMIT 50`,
        [id]
      )

      const leadsFormatted = leads.map((l: any) => ({
        ...l,
        lastContact: l.lastContact ? new Date(l.lastContact).toISOString() : null,
        createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : null,
      }))

      return NextResponse.json(leadsFormatted)
    }
  } catch (error) {
    console.error('Error en GET /api/admin/users/[id]/leads:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
