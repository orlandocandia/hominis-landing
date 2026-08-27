import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const userId = (session.user as any).id as string
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, nombre: true, apellido: true, telefono: true, avatarUrl: true, coverageAreas: true },
    })

    if (!user) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error en GET /api/vendedor/perfil:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAuth()
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const userId = (session.user as any).id as string
    const body = await request.json().catch(() => ({}))

    const updateData: any = {
      ...(body.nombre && { nombre: body.nombre }),
      ...(body.apellido !== undefined && { apellido: body.apellido }),
      ...(body.telefono !== undefined && { telefono: body.telefono }),
    }

    // Change password
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json({ error: 'Falta contraseña actual' }, { status: 400 })
      }
      const user = await db.user.findUnique({ where: { id: userId }, select: { password: true } })
      if (!user) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

      const isValid = await bcrypt.compare(body.currentPassword, user.password)
      if (!isValid) return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 400 })

      updateData.password = await bcrypt.hash(body.newPassword, 10)

      // Notify admin
      try {
        const admin = await db.user.findFirst({ where: { rol: 'ADMIN' }, select: { id: true } })
        if (admin) {
          await db.notification.create({
            data: {
              userId: admin.id,
              type: 'SYSTEM',
              title: 'Cambio de contraseña',
              message: `${session.user?.name || 'Vendedor'} cambió su contraseña.`,
              link: '/admin',
            },
          })
        }
      } catch {}
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, email: true, nombre: true, apellido: true, telefono: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error en PATCH /api/vendedor/perfil:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
