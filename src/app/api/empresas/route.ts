// GET  /api/empresas — listar empresas activas (público, para el login)
// POST /api/empresas — crear empresa (solo ADMIN)
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const libsql = getTursoClient();
    const result = await libsql.execute({
      sql: `SELECT id, nombre, rubro, logo, email, telefono, direccion, cuit, "isActive"
            FROM "Empresa" WHERE "isActive" = 1 ORDER BY nombre ASC`,
    });
    const empresas = result.rows.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: String(row.id),
        nombre: String(row.nombre),
        rubro: String(row.rubro ?? 'SALUD'),
        logo: row.logo ? String(row.logo) : null,
        email: String(row.email ?? ''),
        telefono: row.telefono ? String(row.telefono) : null,
        direccion: row.direccion ? String(row.direccion) : null,
        cuit: row.cuit ? String(row.cuit) : null,
        isActive: Boolean(row.isActive),
      };
    });
    return NextResponse.json(empresas);
  } catch (e: unknown) {
    console.error('[empresas GET] error:', e);
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
    const { nombre, rubro, email, telefono, direccion, cuit, logo } = body;

    if (!nombre || !email) {
      return NextResponse.json(
        { error: 'nombre y email son obligatorios' },
        { status: 400 }
      );
    }

    const libsql = getTursoClient();
    const id = 'emp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    await libsql.execute({
      sql: `INSERT INTO "Empresa" (id, nombre, rubro, email, telefono, direccion, cuit, logo, "isActive")
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      args: [
        id,
        nombre,
        rubro || 'SALUD',
        email.toLowerCase(),
        telefono || null,
        direccion || null,
        cuit || null,
        logo || null,
      ],
    });

    return NextResponse.json({ id, nombre, email }, { status: 201 });
  } catch (e: unknown) {
    console.error('[empresas POST] error:', e);
    const msg = e instanceof Error ? e.message : 'Error del servidor';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
