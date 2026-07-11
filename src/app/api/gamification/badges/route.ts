// GET /api/gamification/badges — all available badges
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { GamificationService } from '@/lib/services/gamification.service';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const badges = await GamificationService.getAvailableBadges();
    return NextResponse.json({ badges });
  } catch (e: any) {
    console.error('[gamification/badges GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
