// Lead Scoring Service — calculates priority for CRM contacts.
// Adapted to raw SQL via libsql (project pattern, not Prisma client).
//
// Scoring rules:
//   +30 PARTICULAR (decisión propia) | +20 MONOTRIBUTO | +10 RECIBO_DE_SUELDO
//   +20 CABA (más accesible) | +10 GBA
//   +20 edad 25-39 (target ideal) | +10 >39 | +5 <25
//   +10 mensaje detallado (>50 chars)
//   +5 por cada campo adicional (address, primaryEmail)
//   -10 si owner es admin_001 (penalización auto-asignación)
//   0  si status RECHAZADO
// Final score clamped to [0, 100].
import { getTursoClient } from '@/lib/turso-config';

export type LeadPriority = 'ALTA' | 'MEDIA' | 'BAJA' | 'NULA';

export interface ContactForScoring {
  segment?: string | null;
  coverage?: string | null;
  age?: number | null;
  message?: string | null;
  address?: string | null;
  primaryEmail?: string | null;
  status?: string | null;
  ownerId?: string | null;
}

export class LeadScoringService {
  /**
   * Calculate a 0-100 score from contact fields (pure function, no DB).
   */
  static calculateScore(contact: ContactForScoring): number {
    let score = 0;

    // Segment
    if (contact.segment === 'PARTICULAR') score += 30;
    else if (contact.segment === 'MONOTRIBUTO') score += 20;
    else if (contact.segment === 'RECIBO_DE_SUELDO') score += 10;

    // Coverage
    if (contact.coverage === 'CABA') score += 20;
    else if (contact.coverage === 'GBA') score += 10;

    // Age
    if (contact.age != null) {
      if (contact.age >= 25 && contact.age <= 39) score += 20;
      else if (contact.age > 39) score += 10;
      else if (contact.age < 25) score += 5;
    }

    // Message length (tiered)
    if (contact.message) {
      if (contact.message.length > 100) score += 10;
      else if (contact.message.length > 50) score += 5;
    }

    // Completeness
    if (contact.address) score += 5;
    if (contact.primaryEmail) score += 5;

    // Penalization: assigned to admin_001 (auto-assignment fallback)
    if (contact.ownerId && contact.ownerId === 'admin_001') score -= 10;

    // Hard reset if rejected
    if (contact.status === 'RECHAZADO') score = 0;

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Map score to priority bucket.
   */
  static getPriority(score: number): LeadPriority {
    if (score >= 70) return 'ALTA';
    if (score >= 40) return 'MEDIA';
    if (score >= 15) return 'BAJA';
    return 'NULA';
  }

  /**
   * Score a contact and persist the result + history.
   * Uses raw SQL via libsql (project pattern).
   */
  static async scoreContact(contactId: string): Promise<{ score: number; priority: LeadPriority }> {
    const libsql = getTursoClient();

    // Load contact
    const res = await libsql.execute({
      sql: `SELECT segment, coverage, age, message, address, primaryEmail, status, ownerId,
            leadScoreHistory FROM Contact WHERE id = ?`,
      args: [contactId],
    });
    if (res.rows.length === 0) throw new Error('Contacto no encontrado');
    const c = res.rows[0] as any;

    const score = this.calculateScore({
      segment: c.segment,
      coverage: c.coverage,
      age: c.age,
      message: c.message,
      address: c.address,
      primaryEmail: c.primaryEmail,
      status: c.status,
      ownerId: c.ownerId,
    });
    const priority = this.getPriority(score);

    // Build history (keep last 10 entries)
    let history: Array<{ score: number; priority: string; date: string }> = [];
    try {
      if (c.leadScoreHistory) history = JSON.parse(c.leadScoreHistory);
    } catch {}
    history.push({ score, priority, date: new Date().toISOString() });
    const historyJson = JSON.stringify(history.slice(-10));

    // Persist
    await libsql.execute({
      sql: `UPDATE Contact SET leadScore = ?, leadPriority = ?, leadScoredAt = CURRENT_TIMESTAMP, leadScoreHistory = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [score, priority, historyJson, contactId],
    });

    return { score, priority };
  }

  /**
   * Bulk re-score all contacts (for backfill after schema migration).
   */
  static async rescoreAll(): Promise<{ total: number; scored: number }> {
    const libsql = getTursoClient();
    const res = await libsql.execute({ sql: 'SELECT id FROM Contact', args: [] });
    const ids = res.rows.map((r) => r.id as string);
    let scored = 0;
    for (const id of ids) {
      try {
        await this.scoreContact(id);
        scored++;
      } catch (e) {
        console.error(`[lead-scoring] failed for ${id}:`, e);
      }
    }
    return { total: ids.length, scored };
  }

  // Alias matching the optimization spec naming
  static async recalculateAllScores(): Promise<{ processed: number; scored: number }> {
    const r = await this.rescoreAll();
    return { processed: r.total, scored: r.scored };
  }

  /**
   * Get priority color classes (for UI).
   */
  static getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      ALTA: 'bg-green-100 text-green-800 border-green-300',
      MEDIA: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      BAJA: 'bg-orange-100 text-orange-800 border-orange-300',
      NULA: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[priority] || colors.NULA;
  }
}
