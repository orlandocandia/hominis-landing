// Tracking Service — source detection + metrics tracking for marketing analytics.
// Uses raw SQL via libsql (project pattern, not Prisma client).
import { getTursoClient } from '@/lib/turso-config';

export class TrackingService {
  /**
   * Detect source name from UTM params or referrer.
   * Returns the source name (matching LeadSource.name) or null.
   */
  static detectSource(utmSource?: string, referrer?: string): string | null {
    if (!utmSource && !referrer) return null;

    const sourceMap: Record<string, string> = {
      google: 'google_ads', 'google_ads': 'google_ads',
      facebook: 'facebook', 'facebook_ads': 'facebook_ads',
      instagram: 'instagram', 'instagram_ads': 'instagram_ads',
      linkedin: 'linkedin', whatsapp: 'whatsapp',
      youtube: 'youtube', tiktok: 'tiktok', twitter: 'twitter',
    };

    if (utmSource) {
      const key = utmSource.toLowerCase().trim();
      return sourceMap[key] || utmSource;
    }

    // Detect by referrer domain
    if (referrer) {
      try {
        const domain = new URL(referrer).hostname;
        if (domain.includes('google')) return 'google_ads';
        if (domain.includes('facebook')) return 'facebook';
        if (domain.includes('instagram')) return 'instagram';
        if (domain.includes('linkedin')) return 'linkedin';
        if (domain.includes('wa.me') || domain.includes('whatsapp')) return 'whatsapp';
        if (domain.includes('youtube')) return 'youtube';
        if (domain.includes('tiktok')) return 'tiktok';
        if (domain.includes('twitter') || domain.includes('x.com')) return 'twitter';
      } catch {}
    }

    return 'organico';
  }

  /**
   * Detect source category from source name.
   */
  static detectSourceCategory(sourceName: string): string {
    const paid = ['google_ads', 'facebook_ads', 'instagram_ads'];
    const social = ['instagram', 'facebook', 'twitter', 'tiktok', 'youtube', 'linkedin'];
    const referral = ['whatsapp', 'referido'];
    if (paid.includes(sourceName)) return 'PAID';
    if (social.includes(sourceName)) return 'SOCIAL';
    if (referral.includes(sourceName)) return 'REFERRAL';
    if (sourceName === 'directo') return 'DIRECT';
    return 'ORGANIC';
  }

  /**
   * Get or create a LeadSource by name. Returns its ID.
   */
  static async getOrCreateSource(name: string, category: string): Promise<string> {
    const libsql = getTursoClient();
    const existing = await libsql.execute({
      sql: 'SELECT id FROM "LeadSource" WHERE name = ?',
      args: [name],
    });
    if (existing.rows.length > 0) return existing.rows[0].id as string;

    // Create new source
    const id = 'src_' + name + '_' + Date.now().toString(36);
    await libsql.execute({
      sql: 'INSERT INTO "LeadSource" (id, name, category, isActive) VALUES (?, ?, ?, 1)',
      args: [id, name, category],
    });
    console.log('[tracking] Created new LeadSource:', name, '(' + category + ')');
    return id;
  }

  /**
   * Track a new lead for a source (increment SourceMetric for today).
   */
  static async trackSource(contactId: string, sourceId: string): Promise<void> {
    const libsql = getTursoClient();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    try {
      await libsql.execute({
        sql: `INSERT INTO "SourceMetric" (id, sourceId, date, leads, conversions, conversionRate, cost, createdAt)
          VALUES (?, ?, ?, 1, 0, 0, 0, CURRENT_TIMESTAMP)
          ON CONFLICT(sourceId, date) DO UPDATE SET leads = leads + 1`,
        args: ['sm_' + sourceId + '_' + today, sourceId, today],
      });
    } catch (e) {
      console.warn('[tracking] trackSource failed:', e);
    }
  }

  /**
   * Track a conversion for a contact's source (increment conversions in SourceMetric).
   * Called when a contact's status changes to ATENDIDO.
   */
  static async trackConversion(contactId: string): Promise<void> {
    const libsql = getTursoClient();
    // Get contact's sourceId
    const contactRes = await libsql.execute({
      sql: 'SELECT sourceId FROM Contact WHERE id = ?',
      args: [contactId],
    });
    if (contactRes.rows.length === 0) return;
    const sourceId = (contactRes.rows[0] as any).sourceId;
    if (!sourceId) return;

    const today = new Date().toISOString().split('T')[0];
    try {
      // Try to increment existing metric
      const result = await libsql.execute({
        sql: `UPDATE "SourceMetric" SET conversions = conversions + 1 WHERE sourceId = ? AND date = ?`,
        args: [sourceId, today],
      });
      // If no row updated, create one
      if (result.rowsAffected === 0) {
        await libsql.execute({
          sql: `INSERT INTO "SourceMetric" (id, sourceId, date, leads, conversions, conversionRate, cost, createdAt)
            VALUES (?, ?, ?, 0, 1, 0, 0, CURRENT_TIMESTAMP)`,
          args: ['sm_' + sourceId + '_' + today, sourceId, today],
        });
      }
      // Recalculate conversionRate for this source/day
      await libsql.execute({
        sql: `UPDATE "SourceMetric" SET conversionRate = 
          CASE WHEN leads > 0 THEN ROUND(100.0 * conversions / leads, 2) ELSE 0 END
          WHERE sourceId = ? AND date = ?`,
        args: [sourceId, today],
      });
    } catch (e) {
      console.warn('[tracking] trackConversion failed:', e);
    }
  }

  /**
   * Get metrics grouped by source for a date range.
   */
  static async getMetrics(startDate: Date, endDate: Date): Promise<any[]> {
    const libsql = getTursoClient();
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    const res = await libsql.execute({
      sql: `SELECT s.id as sourceId, s.name as sourceName, s.category,
        COALESCE(SUM(m.leads), 0) as totalLeads,
        COALESCE(SUM(m.conversions), 0) as totalConversions,
        COALESCE(SUM(m.cost), 0) as totalCost
        FROM "LeadSource" s
        LEFT JOIN "SourceMetric" m ON s.id = m.sourceId AND m.date >= ? AND m.date <= ?
        WHERE s.isActive = 1
        GROUP BY s.id, s.name, s.category
        ORDER BY totalLeads DESC`,
      args: [startISO, endISO],
    });

    return res.rows.map((r: any) => ({
      sourceId: r.sourceId,
      sourceName: r.sourceName,
      category: r.category,
      totalLeads: Number(r.totalLeads),
      totalConversions: Number(r.totalConversions),
      totalCost: Number(r.totalCost),
      conversionRate: Number(r.totalLeads) > 0 ? Number(((Number(r.totalConversions) / Number(r.totalLeads)) * 100).toFixed(2)) : 0,
    }));
  }
}
