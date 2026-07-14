// GET  /api/admin/empresas — listar empresas (solo ADMIN, incluye inactivas)
// POST /api/admin/empresas — crear empresa (solo ADMIN)
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const libsql = getTursoClient();
    const result = await libsql.execute({
      sql: `SELECT id, nombre, rubro, email, telefono, direccion, cuit, logo, "isActive"
            FROM "Empresa" ORDER BY nombre ASC`,
    });

    const empresas = result.rows.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: String(row.id),
        nombre: String(row.nombre),
        rubro: String(row.rubro ?? 'SALUD'),
        email: String(row.email ?? ''),
        telefono: row.telefono ? String(row.telefono) : null,
        direccion: row.direccion ? String(row.direccion) : null,
        cuit: row.cuit ? String(row.cuit) : null,
        logo: row.logo ? String(row.logo) : null,
        isActive: Boolean(row.isActive),
      };
    });

    return NextResponse.json(empresas);
  } catch (e: unknown) {
    console.error('[admin/empresas GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { nombre, email, telefono, direccion } = body;

    if (!nombre || !email) {
      return NextResponse.json({ error: 'nombre y email son obligatorios' }, { status: 400 });
    }

    const libsql = getTursoClient();
    const id = 'emp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    await libsql.execute({
      sql: `INSERT INTO "Empresa" (id, nombre, rubro, email, telefono, direccion, "isActive")
            VALUES (?, ?, 'SALUD', ?, ?, ?, 1)`,
      args: [id, nombre, email.toLowerCase(), telefono || null, direccion || null],
    });

    return NextResponse.json({ id, nombre, email }, { status: 201 });
  } catch (e: unknown) {
    console.error('[admin/empresas POST] error:', e);
    const msg = e instanceof Error ? e.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
