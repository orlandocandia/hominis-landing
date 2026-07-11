// GET /api/followups — list followups for current user (upcoming first)
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { FollowupService } from '@/lib/services/followup.service';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const followups = await FollowupService.getUpcomingForUser(session.user.id, limit);
    return NextResponse.json({ followups });
  } catch (e: any) {
    console.error('[followups GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
