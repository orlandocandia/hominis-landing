// GET /api/cron/followups — process pending follow-ups (called by cron job)
// Security: requires CRON_SECRET in Authorization header.
// Configure in Vercel: cron job hitting this endpoint with the secret.
import { NextResponse } from 'next/server';
import { FollowupService } from '@/lib/services/followup.service';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await FollowupService.processPendingFollowups();
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error('[cron/followups] error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Allow cron to run for up to 60s
export const maxDuration = 60;
