// GET /api/admin/reports/performance — per-vendor performance report
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { ReportService } from '@/lib/services/report.service';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = searchParams.get('end') || new Date().toISOString().split('T')[0];

    const startDate = new Date(start + 'T00:00:00');
    const endDate = new Date(end + 'T23:59:59');

    const vendors = await ReportService.generatePerformanceReport(startDate, endDate);
    return NextResponse.json({ vendors, dateRange: { start, end } });
  } catch (e: any) {
    console.error('[reports/performance GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
