// GET /api/admin/marketing/metrics — aggregated marketing analytics
// Returns: totalLeads, totalConversions, conversionRate, costPerLead, roi,
// sources breakdown, and daily trend (last 30 days).
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { getTursoClient } from '@/lib/turso-config';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const libsql = getTursoClient();

    // 1. Aggregate from SourceMetric
    const totalsRes = await libsql.execute({
      sql: `SELECT
        COALESCE(SUM(leads), 0) as totalLeads,
        COALESCE(SUM(conversions), 0) as totalConversions,
        COALESCE(SUM(cost), 0) as totalCost
        FROM "SourceMetric"`,
    });
    const t = totalsRes.rows[0] as any;
    const totalLeads = Number(t.totalLeads) || 0;
    const totalConversions = Number(t.totalConversions) || 0;
    const totalCost = Number(t.totalCost) || 0;
    const conversionRate = totalLeads > 0 ? Number(((totalConversions / totalLeads) * 100).toFixed(2)) : 0;
    const costPerLead = totalLeads > 0 ? Number((totalCost / totalLeads).toFixed(2)) : 0;
    // ROI: assume each conversion is worth $500 (placeholder — adjust with real revenue)
    const avgRevenuePerConversion = 500;
    const totalRevenue = totalConversions * avgRevenuePerConversion;
    const roi = totalCost > 0 ? Number((totalRevenue / totalCost).toFixed(2)) : 0;

    // 2. Per-source breakdown
    const sourcesRes = await libsql.execute({
      sql: `SELECT s.id, s.name, s.category,
        COALESCE(SUM(m.leads), 0) as leads,
        COALESCE(SUM(m.conversions), 0) as conversions,
        COALESCE(SUM(m.cost), 0) as cost
        FROM "LeadSource" s
        LEFT JOIN "SourceMetric" m ON s.id = m.sourceId
        WHERE s.isActive = 1
        GROUP BY s.id, s.name, s.category
        ORDER BY leads DESC`,
    });
    const sources = sourcesRes.rows.map((r: any) => ({
      id: r.id, name: r.name, category: r.category,
      leads: Number(r.leads), conversions: Number(r.conversions), cost: Number(r.cost),
      conversionRate: Number(r.leads) > 0 ? Number(((Number(r.conversions) / Number(r.leads)) * 100).toFixed(2)) : 0,
    }));

    // 3. Daily trend (last 30 days)
    const dailyRes = await libsql.execute({
      sql: `SELECT DATE(m.date) as date,
        SUM(m.leads) as leads,
        SUM(m.conversions) as conversions
        FROM "SourceMetric" m
        WHERE m.date >= datetime('now', '-30 days')
        GROUP BY DATE(m.date)
        ORDER BY date ASC`,
    });
    const dailyData = dailyRes.rows.map((r: any) => ({
      date: r.date, leads: Number(r.leads), conversions: Number(r.conversions),
    }));

    // 4. Contacts without source (manual creation)
    const unsourcedRes = await libsql.execute({
      sql: `SELECT COUNT(*) as n FROM Contact WHERE sourceId IS NULL`,
    });
    const unsourced = Number((unsourcedRes.rows[0] as any).n);

    return NextResponse.json({
      totalLeads,
      totalConversions,
      conversionRate,
      costPerLead,
      roi,
      totalCost,
      totalRevenue,
      sources,
      dailyData,
      unsourced,
      avgRevenuePerConversion,
    });
  } catch (e: any) {
    console.error('[marketing/metrics GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
