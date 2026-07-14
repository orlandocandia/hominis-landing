// GET  /api/admin/empresas — listar empresas (solo ADMIN, incluye inactivas)
// POST /api/admin/empresas — crear empresa (solo ADMIN)
import { NextResponse } from 'next/server';
import { getTursoClient } from '@/lib/turso-config';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return new Response('Forbidden', { status: 403 });
    }

    const libsql = getTursoClient();
    const result = await libsql.execute({
      sql: `SELECT id, nombre, rubro, email, telefono, direccion, cuit, logo, "isActive", createdAt
        FROM "Empresa" ORDER BY nombre ASC`,
    });

    return NextResponse.json(result.rows);
  } catch (e: unknown) {
    console.error('[admin/empresas GET] error:', e);
    return new Response('Error interno', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return new Response('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const { nombre, email, telefono, direccion } = body;

    if (!nombre || !email) {
      return new Response('Nombre y email son requeridos', { status: 400 });
    }

    const libsql = getTursoClient();
    const id = 'emp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    await libsql.execute({
      sql: `INSERT INTO "Empresa" (id, nombre, rubro, email, telefono, direccion, "isActive", createdAt, updatedAt)
        VALUES (?, ?, 'SALUD', ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [id, nombre, email.toLowerCase(), telefono || null, direccion || null],
    });

    return NextResponse.json({ id, nombre, email }, { status: 201 });
  } catch (e: unknown) {
    console.error('[admin/empresas POST] error:', e);
    const msg = e instanceof Error ? e.message : 'Error interno';
    return new Response(msg, { status: 500 });
  }
}
