// GET /api/admin/reports/sales — sales report (JSON or Excel)
// Query: ?start=YYYY-MM-DD&end=YYYY-MM-DD&format=json|excel&vendor=ID&segment=X&source=ID
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
    const format = searchParams.get('format') || 'json';

    // Filters
    const filters = {
      ownerId: searchParams.get('vendor') || undefined,
      segment: searchParams.get('segment') || undefined,
      sourceId: searchParams.get('source') || undefined,
    };

    const startDate = new Date(start + 'T00:00:00');
    const endDate = new Date(end + 'T23:59:59');

    const report = await ReportService.generateSalesReport(startDate, endDate, filters);

    if (format === 'excel') {
      const buffer = await ReportService.exportExcel(report.contacts);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="reporte_ventas_${start}_a_${end}.xlsx"`,
        },
      });
    }

    // Don't return raw contacts in JSON (too large) — return summary only
    return NextResponse.json({
      totalLeads: report.totalLeads,
      conversions: report.conversions,
      conversionRate: report.conversionRate,
      byStatus: report.byStatus,
      bySegment: report.bySegment,
      byVendor: report.byVendor,
      bySource: report.bySource,
      dateRange: { start, end },
      filters,
    });
  } catch (e: any) {
    console.error('[reports/sales GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
