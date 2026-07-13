// GET /api/tareas — list tasks (admin sees all, vendedor sees own)
// POST /api/tareas — create task (admin only)
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

const VALID_TIPOS = ['VISITA', 'LLAMADA', 'WHATSAPP', 'EMAIL', 'REUNION', 'TAREA'];
const VALID_ESTADOS = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA'];

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const vendedorId = searchParams.get('vendedorId');

    // Multiempresa: la empresa activa viene de la sesión
    const empresaFiltro = session.user.empresaId || null;

    const libsql = getTursoClient();
    let sql = `SELECT t.*, u.nombre as vendedorNombre, u.apellido as vendedorApellido, u.email as vendedorEmail,
      u2.nombre as adminNombre, c.name as contactoNombre, c.primaryPhone as contactoPhone
      FROM "Tarea" t
      LEFT JOIN "User" u ON t.asignadoA = u.id
      LEFT JOIN "User" u2 ON t.asignadoPor = u2.id
      LEFT JOIN Contact c ON t.contactoId = c.id`;
    const conditions: string[] = [];
    const args: any[] = [];

    // Filtro por empresa (seguridad multiempresa)
    if (empresaFiltro) {
      conditions.push('t.empresaId = ?');
      args.push(empresaFiltro);
    }

    if (session.user.role !== 'ADMIN') {
      conditions.push('t.asignadoA = ?');
      args.push(session.user.id);
    }
    if (estado && VALID_ESTADOS.includes(estado)) {
      conditions.push('t.estado = ?');
      args.push(estado);
    }
    if (vendedorId && session.user.role === 'ADMIN') {
      conditions.push('t.asignadoA = ?');
      args.push(vendedorId);
    }
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY t.fechaLimite ASC';

    const result = await libsql.execute({ sql, args });
    return NextResponse.json({ tareas: result.rows });
  } catch (e: any) {
    console.error('[tareas GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { titulo, descripcion, tipo, asignadoA, fechaLimite, contactoId } = body;

    if (!titulo || !asignadoA || !fechaLimite) {
      return NextResponse.json({ error: 'titulo, asignadoA y fechaLimite son obligatorios' }, { status: 400 });
    }

    const tipoTarea = VALID_TIPOS.includes(tipo) ? tipo : 'TAREA';
    const libsql = getTursoClient();
    const id = 'tarea_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

    // Multiempresa: la tarea hereda la empresa del admin (o del query param)
    const tareaEmpresaId = session.user.empresaId || null;

    await libsql.execute({
      sql: `INSERT INTO "Tarea" (id, titulo, descripcion, tipo, estado, fechaLimite, asignadoA, asignadoPor, contactoId, empresaId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, 'PENDIENTE', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [id, titulo, descripcion || null, tipoTarea, new Date(fechaLimite).toISOString(), asignadoA, session.user.id, contactoId || null, tareaEmpresaId],
    });

    // Create notification for the vendor (with empresaId)
    const notifId = 'notif_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await libsql.execute({
      sql: `INSERT INTO Notification (id, userId, type, title, message, link, empresaId, createdAt)
        VALUES (?, ?, 'SYSTEM', ?, ?, '/vendedor/tareas', ?, CURRENT_TIMESTAMP)`,
      args: [notifId, asignadoA, `📋 Nueva tarea: ${titulo}`, descripcion || 'Tienes una nueva tarea asignada', tareaEmpresaId],
    });

    return NextResponse.json({ id, titulo, tipo: tipoTarea, estado: 'PENDIENTE', asignadoA });
  } catch (e: any) {
    console.error('[tareas POST] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}


