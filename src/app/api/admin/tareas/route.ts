// GET  /api/admin/tareas — lista paginada de tareas con filtros (admin)
// POST /api/admin/tareas — crear tarea + notificar al vendedor
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '15')));
    const offset = (page - 1) * limit;
    const estado = searchParams.get('estado');
    const tipo = searchParams.get('tipo');
    const prioridad = searchParams.get('prioridad');
    const vendedorId = searchParams.get('vendedorId');
    const search = searchParams.get('search');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    const empresaId = session.user.empresaId || null;

    const libsql = getTursoClient();
    const conditions: string[] = [];
    const args: (string | number)[] = [];

    if (empresaId) { conditions.push('t.empresaId = ?'); args.push(empresaId); }
    if (estado) { conditions.push('t.estado = ?'); args.push(estado); }
    if (tipo) { conditions.push('t.tipo = ?'); args.push(tipo); }
    if (prioridad) { conditions.push('t.prioridad = ?'); args.push(prioridad); }
    if (vendedorId) { conditions.push('t.asignadoA = ?'); args.push(vendedorId); }
    if (search) { conditions.push('t.titulo LIKE ?'); args.push(`%${search}%`); }
    if (fechaDesde) { conditions.push('t.createdAt >= ?'); args.push(fechaDesde); }
    if (fechaHasta) { conditions.push('t.createdAt <= ?'); args.push(fechaHasta + ' 23:59:59'); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Count
    const countRes = await libsql.execute({
      sql: `SELECT COUNT(*) AS total FROM Tarea t ${where}`,
      args,
    });
    const total = Number(countRes.rows[0]?.total ?? 0);

    // Tareas con JOIN (alias Contact.name → contactoNombre, primaryPhone → contactoTelefono)
    const result = await libsql.execute({
      sql: `SELECT t.id, t.titulo, t.descripcion, t.tipo, t.estado, t.prioridad,
          t.fechaLimite, t.fechaCompletada, t.asignadoA, t.asignadoPor, t.contactoId, t.empresaId,
          t.createdAt, t.updatedAt,
          u.nombre AS vendedorNombre, u.apellido AS vendedorApellido, u.email AS vendedorEmail,
          c.name AS contactoNombre, c.primaryPhone AS contactoTelefono
        FROM Tarea t
        LEFT JOIN "User" u ON t.asignadoA = u.id
        LEFT JOIN "Contact" c ON t.contactoId = c.id
        ${where}
        ORDER BY
          CASE t.prioridad WHEN 'ALTA' THEN 1 WHEN 'MEDIA' THEN 2 WHEN 'BAJA' THEN 3 ELSE 4 END,
          t.fechaLimite ASC,
          t.createdAt DESC
        LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    });

    return NextResponse.json({
      tareas: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e: unknown) {
    console.error('[admin/tareas GET] error:', e);
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
    const { titulo, descripcion, tipo, prioridad, fechaLimite, asignadoA, contactoId } = body;

    if (!titulo || !asignadoA) {
      return NextResponse.json({ error: 'titulo y asignadoA son requeridos' }, { status: 400 });
    }

    const libsql = getTursoClient();

    // Obtener empresa del vendedor destinatario
    const vendedorRes = await libsql.execute({
      sql: 'SELECT empresaId FROM "User" WHERE id = ?',
      args: [asignadoA],
    });
    if (vendedorRes.rows.length === 0) {
      return NextResponse.json({ error: 'Vendedor no encontrado' }, { status: 404 });
    }
    const empresaId = (vendedorRes.rows[0] as Record<string, unknown>).empresaId as string | null;
    if (!empresaId) {
      return NextResponse.json({ error: 'El vendedor no tiene empresa asignada' }, { status: 400 });
    }

    const tareaId = 'tarea_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    // fechaLimite es NOT NULL en DB — si no viene, usar +24h
    const fechaFinal = fechaLimite
      ? new Date(fechaLimite).toISOString()
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const tipoFinal = tipo || 'TAREA';
    const prioridadFinal = prioridad || 'MEDIA';

    await libsql.execute({
      sql: `INSERT INTO Tarea (id, titulo, descripcion, tipo, estado, prioridad, fechaLimite,
        asignadoA, asignadoPor, contactoId, empresaId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, 'PENDIENTE', ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [
        tareaId, titulo, descripcion || null, tipoFinal, prioridadFinal, fechaFinal,
        asignadoA, session.user.id, contactoId || null, empresaId,
      ],
    });

    // Crear notificación para el vendedor (columnas reales: title, message, type)
    const notifId = 'notif_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await libsql.execute({
      sql: `INSERT INTO Notification (id, userId, type, title, message, link, empresaId, createdAt)
        VALUES (?, ?, 'SYSTEM', ?, ?, '/vendedor/tareas', ?, CURRENT_TIMESTAMP)`,
      args: [notifId, asignadoA, '📋 Nueva tarea asignada', `Se te asignó: ${titulo}`, empresaId],
    });

    return NextResponse.json({ id: tareaId, titulo, estado: 'PENDIENTE' }, { status: 201 });
  } catch (e: unknown) {
    console.error('[admin/tareas POST] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
