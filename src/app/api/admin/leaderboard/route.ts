// GET /api/admin/leaderboard — top users by gamification points
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { GamificationService } from '@/lib/services/gamification.service';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const [rankings, badges] = await Promise.all([
      GamificationService.getLeaderboard(20),
      GamificationService.getAllBadges(),
    ]);

    return NextResponse.json({ rankings, badges });
  } catch (e: any) {
    console.error('[leaderboard GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
