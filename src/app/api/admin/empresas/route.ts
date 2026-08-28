import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { queryLibsql } from '@/lib/libsql-db'

export const dynamic = 'force-dynamic'

// GET /api/admin/empresas — list all empresas
// FLUJO: intenta Prisma primero; si falla, usa fallback libsql.
export async function GET() {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // === INTENTO 1: Prisma ===
    try {
      const empresas = await db.empresa.findMany({
        orderBy: { nombre: 'asc' },
      })
      return NextResponse.json(empresas)
    } catch (prismaErr) {
      // Fallback: libsql directo
      console.warn('[admin/empresas] Prisma fallo, usando fallback libsql. Error:', (prismaErr as Error)?.message?.slice(0, 150))

      const empresas = await queryLibsql(
        'SELECT id, nombre, rubro, logo, email, telefono, direccion, cuit, isActive, createdAt, updatedAt FROM Empresa ORDER BY nombre ASC'
      )

      // Convertir fechas a ISO string para consistencia con Prisma
      const empresasFormatted = empresas.map((e: any) => ({
        ...e,
        createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : null,
        updatedAt: e.updatedAt ? new Date(e.updatedAt).toISOString() : null,
      }))

      return NextResponse.json(empresasFormatted)
    }
  } catch (error) {
    console.error('Error en GET /api/admin/empresas:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/admin/empresas — create empresa
export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    if (!body.nombre) return NextResponse.json({ error: 'Falta nombre' }, { status: 400 })

    const empresa = await db.empresa.create({
      data: {
        nombre: body.nombre,
        rubro: body.rubro || 'SALUD',
        email: body.email || '',
        telefono: body.telefono || null,
        direccion: body.direccion || null,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(empresa, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/admin/empresas:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
