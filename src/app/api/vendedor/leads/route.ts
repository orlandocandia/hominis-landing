import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql, scalarLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    let userId = (session.user as any).id as string

    if (userId === 'admin-hardcodeado') {
      return NextResponse.json({ leads: [], total: 0 })
    }

    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado') || ''

    // === INTENTO 1: Prisma ===
    try {
      const where: any = { ownerId: userId }
      if (estado) where.status = estado

      const leads = await db.contact.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, primaryEmail: true, primaryPhone: true,
          message: true, status: true, sourceReferrer: true, createdAt: true,
        },
      })

      return NextResponse.json({ leads, total: leads.length })
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[vendedor/leads GET] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      let sql = `SELECT id, name, primaryEmail, primaryPhone, message, status, sourceReferrer, createdAt
                 FROM Contact WHERE ownerId = ?`
      const args: any[] = [userId]
      if (estado) {
        sql += ' AND status = ?'
        args.push(estado)
      }
      sql += ' ORDER BY createdAt DESC'

      const leads = await queryLibsql(sql, args)

      const leadsFormatted = leads.map((l: any) => ({
        ...l,
        createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : null,
      }))

      return NextResponse.json({ leads: leadsFormatted, total: leadsFormatted.length })
    }
  } catch (error) {
    console.error('Error en GET /api/vendedor/leads:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
