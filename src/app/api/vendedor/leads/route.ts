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
  } catch (error) {
    console.error('Error en GET /api/vendedor/leads:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
