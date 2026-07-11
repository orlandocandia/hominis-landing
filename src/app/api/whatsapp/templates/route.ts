// GET /api/whatsapp/templates — list all active WhatsApp templates
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const libsql = getTursoClient();
    const result = await libsql.execute({
      sql: 'SELECT id, name, language, category, body, variables FROM "WhatsAppTemplate" WHERE isActive = 1 ORDER BY name',
    });
    const templates = result.rows.map((r: any) => ({
      ...r,
      variables: r.variables ? JSON.parse(r.variables) : [],
    }));
    return NextResponse.json({ templates });
  } catch (e: any) {
    console.error('[whatsapp/templates GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
