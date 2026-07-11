// Followup Service — schedules + processes automated follow-ups.
// Adapted to raw SQL via libsql (project pattern, not Prisma client).
//
// Flow:
//   1. When a contact is created → scheduleFollowups() creates Followup rows
//      for each active FollowupTemplate (with delayDays offset).
//   2. A cron job (GET /api/cron/followups) calls processPendingFollowups()
//      to send due follow-ups (scheduledDate <= now, status PENDING).
//   3. sendFollowup() dispatches via WhatsApp/Email — currently logs only
//      (WhatsApp/Email sending can be wired to real services later).
import { getTursoClient } from '@/lib/turso-config';

export class FollowupService {
  /**
   * Schedule follow-ups for a newly created contact.
   * Reads all active FollowupTemplates and creates Followup rows with
   * scheduledDate = now + delayDays.
   */
  static async scheduleFollowups(contactId: string, ownerId: string): Promise<number> {
    const libsql = getTursoClient();

    // Load active templates
    const templatesRes = await libsql.execute({
      sql: 'SELECT id, name, type, subject, body, delayDays FROM "FollowupTemplate" WHERE isActive = 1 ORDER BY delayDays ASC',
    });
    const templates = templatesRes.rows as any[];
    if (templates.length === 0) return 0;

    // Load contact for template variable substitution
    const contactRes = await libsql.execute({
      sql: 'SELECT name, primaryPhone, primaryEmail FROM Contact WHERE id = ?',
      args: [contactId],
    });
    if (contactRes.rows.length === 0) return 0;
    const contact = contactRes.rows[0] as any;

    let scheduled = 0;
    for (const t of templates) {
      const scheduledDate = new Date(Date.now() + (t.delayDays || 0) * 24 * 60 * 60 * 1000).toISOString();
      const content = (t.body as string)
        .replace(/\{nombre\}/g, contact.name || '')
        .replace(/\{telefono\}/g, contact.primaryPhone || '')
        .replace(/\{email\}/g, contact.primaryEmail || '');
      const id = 'fu_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + '_' + scheduled;
      try {
        await libsql.execute({
          sql: `INSERT INTO "Followup" (id, contactId, userId, scheduledDate, status, type, templateId, content, createdAt)
            VALUES (?, ?, ?, ?, 'PENDING', ?, ?, ?, CURRENT_TIMESTAMP)`,
          args: [id, contactId, ownerId, scheduledDate, t.type, t.id, content],
        });
        scheduled++;
      } catch (e) {
        console.error('[followup] schedule failed for template', t.name, e);
      }
    }
    return scheduled;
  }

  /**
   * Process all pending follow-ups that are due (scheduledDate <= now).
   * Called by the cron job endpoint.
   */
  static async processPendingFollowups(): Promise<{ processed: number; sent: number; failed: number }> {
    const libsql = getTursoClient();

    const pendingRes = await libsql.execute({
      sql: `SELECT f.id, f.type, f.content, f.contactId, f.templateId,
        c.name as contactName, c.primaryPhone, c.primaryEmail, c.ownerId,
        u.email as userEmail, u.nombre as userNombre
        FROM "Followup" f
        JOIN Contact c ON f.contactId = c.id
        JOIN "User" u ON f.userId = u.id
        WHERE f.status = 'PENDING' AND f.scheduledDate <= CURRENT_TIMESTAMP
        ORDER BY f.scheduledDate ASC LIMIT 100`,
    });
    const pending = pendingRes.rows as any[];

    let sent = 0;
    let failed = 0;
    for (const f of pending) {
      try {
        await this.sendFollowup(f);
        await libsql.execute({
          sql: 'UPDATE "Followup" SET status = ?, executedDate = CURRENT_TIMESTAMP WHERE id = ?',
          args: ['SENT', f.id],
        });
        // Create in-app notification for the owner
        const notifId = 'notif_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        await libsql.execute({
          sql: `INSERT INTO Notification (id, userId, type, title, message, link, createdAt)
            VALUES (?, ?, 'REMINDER', ?, ?, ?, CURRENT_TIMESTAMP)`,
          args: [
            notifId, f.ownerId,
            `Follow-up enviado: ${f.contactName}`,
            `Se envió un seguimiento (${f.type}) a ${f.contactName}.`,
            `/vendedor/contactos/${f.contactId}`,
          ],
        });
        sent++;
      } catch (e: any) {
        await libsql.execute({
          sql: 'UPDATE "Followup" SET status = ?, metadata = ?, executedDate = CURRENT_TIMESTAMP WHERE id = ?',
          args: ['FAILED', JSON.stringify({ error: e.message }), f.id],
        });
        failed++;
      }
    }
    return { processed: pending.length, sent, failed };
  }

  /**
   * Dispatch a follow-up via the appropriate channel.
   * Currently logs — wire to real WhatsApp/Email services later.
   */
  private static async sendFollowup(f: any): Promise<void> {
    if (f.type === 'WHATSAPP') {
      if (!f.primaryPhone) throw new Error('Contacto sin teléfono');
      // TODO: integrate with WhatsApp Business API
      console.log(`[followup] WHATSAPP to ${f.primaryPhone}: ${f.content?.substring(0, 50)}...`);
    } else if (f.type === 'EMAIL') {
      if (!f.primaryEmail) throw new Error('Contacto sin email');
      // TODO: integrate with Resend
      console.log(`[followup] EMAIL to ${f.primaryEmail}: ${f.content?.substring(0, 50)}...`);
    } else if (f.type === 'CALL') {
      // CALL type = reminder to the vendor, no automated send
      console.log(`[followup] CALL reminder for ${f.contactName} — notify owner ${f.userEmail}`);
    }
    // Simulate async send
    await new Promise((r) => setTimeout(r, 50));
  }

  /**
   * Get upcoming follow-ups for a user (for dashboard display).
   */
  static async getUpcomingForUser(userId: string, limit = 10): Promise<any[]> {
    const libsql = getTursoClient();
    const res = await libsql.execute({
      sql: `SELECT f.id, f.scheduledDate, f.status, f.type, f.content,
        c.name as contactName, c.id as contactId
        FROM "Followup" f
        JOIN Contact c ON f.contactId = c.id
        WHERE f.userId = ? AND f.status = 'PENDING'
        ORDER BY f.scheduledDate ASC LIMIT ?`,
      args: [userId, limit],
    });
    return res.rows;
  }
}
