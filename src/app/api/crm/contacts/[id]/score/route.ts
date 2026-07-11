// POST /api/crm/contacts/[id]/score — manually re-score a contact
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';
import { LeadScoringService } from '@/lib/services/lead-scoring.service';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const { id } = await params;

    // Verify access (vendedor only their own)
    const libsql = getTursoClient();
    const existing = await libsql.execute({ sql: 'SELECT ownerId FROM Contact WHERE id = ?', args: [id] });
    if (existing.rows.length === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    if (session.user.role === 'VENDEDOR' && existing.rows[0].ownerId !== session.user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const result = await LeadScoringService.scoreContact(id);
    return NextResponse.json({ id, ...result });
  } catch (e: any) {
    console.error('[score POST] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
