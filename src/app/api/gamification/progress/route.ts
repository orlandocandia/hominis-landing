// GET /api/gamification/progress — current user's gamification progress
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { GamificationService } from '@/lib/services/gamification.service';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const progress = await GamificationService.getUserProgress(session.user.id);
    return NextResponse.json(progress);
  } catch (e: any) {
    console.error('[gamification/progress GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
