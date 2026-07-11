// Gamification Service — awards points + badges based on user actions.
// Uses raw SQL via libsql (project pattern, not Prisma client).
import { getTursoClient } from '@/lib/turso-config';

const POINTS_MAP: Record<string, number> = {
  CONTACT_CREATED: 10,
  CONTACT_ATTENDED: 50,
  LEAD_SCORE_ALTA: 20,
  FAST_RESPONSE: 15,
  CONVERSION: 100,
  REUNION_AGENDADA: 30,
  PRESUPUESTO_ENVIADO: 40,
};

export class GamificationService {
  /**
   * Award points for an action + check for new badges.
   */
  static async awardPoints(userId: string, action: string): Promise<{ pointsAwarded: number; newBadges: string[] }> {
    const points = POINTS_MAP[action] || 0;
    if (points === 0) return { pointsAwarded: 0, newBadges: [] };

    const libsql = getTursoClient();

    // Upsert gamification record
    const existing = await libsql.execute({ sql: 'SELECT id, points, badges FROM "Gamification" WHERE userId = ?', args: [userId] });
    let gamificationId: string;
    let currentBadges: string[] = [];

    if (existing.rows.length === 0) {
      gamificationId = 'gam_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      await libsql.execute({
        sql: 'INSERT INTO "Gamification" (id, userId, points, level, badges, updatedAt) VALUES (?, ?, ?, 1, NULL, CURRENT_TIMESTAMP)',
        args: [gamificationId, userId, points],
      });
    } else {
      const row = existing.rows[0] as any;
      gamificationId = row.id;
      currentBadges = row.badges ? JSON.parse(row.badges) : [];
      const newPoints = Number(row.points) + points;
      const level = Math.floor(newPoints / 100) + 1; // 1 level per 100 points
      await libsql.execute({
        sql: 'UPDATE "Gamification" SET points = ?, level = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        args: [newPoints, level, gamificationId],
      });
    }

    // Check for new badges
    const newBadges = await this.checkBadges(userId, currentBadges);

    return { pointsAwarded: points, newBadges };
  }

  /**
   * Check all badges and award any newly-unlocked ones.
   */
  static async checkBadges(userId: string, currentBadgeIds: string[]): Promise<string[]> {
    const libsql = getTursoClient();

    const badgesRes = await libsql.execute({ sql: 'SELECT id, name, conditionType, conditionValue, pointsAward FROM "Badge"' });
    const badges = badgesRes.rows as any[];

    // Get user stats
    const [leadsRes, conversionsRes, pointsRes] = await Promise.all([
      libsql.execute({ sql: 'SELECT COUNT(*) as n FROM Contact WHERE ownerId = ?', args: [userId] }),
      libsql.execute({ sql: "SELECT COUNT(*) as n FROM Contact WHERE ownerId = ? AND status = 'ATENDIDO'", args: [userId] }),
      libsql.execute({ sql: 'SELECT points FROM "Gamification" WHERE userId = ?', args: [userId] }),
    ]);
    const leadCount = Number((leadsRes.rows[0] as any).n);
    const conversionCount = Number((conversionsRes.rows[0] as any).n);
    const totalPoints = Number((pointsRes.rows[0] as any).points || 0);

    const newlyUnlocked: string[] = [];
    for (const badge of badges) {
      if (currentBadgeIds.includes(badge.id)) continue;

      let conditionMet = false;
      switch (badge.conditionType) {
        case 'LEADS': conditionMet = leadCount >= badge.conditionValue; break;
        case 'CONVERSIONS': conditionMet = conversionCount >= badge.conditionValue; break;
        case 'POINTS': conditionMet = totalPoints >= badge.conditionValue; break;
        case 'FAST_RESPONSE': conditionMet = false; break; // TODO: track response time
      }

      if (conditionMet) {
        newlyUnlocked.push(badge.id);
        currentBadgeIds.push(badge.id);
        // Award bonus points for badge
        if (badge.pointsAward > 0) {
          await libsql.execute({
            sql: 'UPDATE "Gamification" SET points = points + ?, updatedAt = CURRENT_TIMESTAMP WHERE userId = ?',
            args: [badge.pointsAward, userId],
          });
        }
        // Create in-app notification
        const notifId = 'notif_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        await libsql.execute({
          sql: `INSERT INTO Notification (id, userId, type, title, message, createdAt)
            VALUES (?, ?, 'SYSTEM', ?, ?, CURRENT_TIMESTAMP)`,
          args: [notifId, userId, `¡Badge desbloqueado: ${badge.name}!`, `Conseguiste el badge "${badge.name}" (+${badge.pointsAward} pts)`],
        });
      }
    }

    // Persist badges array
    if (newlyUnlocked.length > 0) {
      await libsql.execute({
        sql: 'UPDATE "Gamification" SET badges = ?, updatedAt = CURRENT_TIMESTAMP WHERE userId = ?',
        args: [JSON.stringify(currentBadgeIds), userId],
      });
    }

    return newlyUnlocked;
  }

  /**
   * Get leaderboard (top users by points).
   */
  static async getLeaderboard(limit = 20): Promise<any[]> {
    const libsql = getTursoClient();
    const res = await libsql.execute({
      sql: `SELECT g.userId, g.points, g.level, g.badges,
        u.nombre, u.apellido, u.email, u.rol, u.avatarUrl,
        u.totalContacts, u.conversionRate,
        (SELECT COUNT(*) FROM Contact WHERE ownerId = u.id AND status = 'ATENDIDO') as conversions
        FROM "Gamification" g
        JOIN "User" u ON g.userId = u.id
        WHERE u.activo = 1
        ORDER BY g.points DESC
        LIMIT ?`,
      args: [limit],
    });
    return res.rows.map((r: any) => ({
      ...r,
      badges: r.badges ? JSON.parse(r.badges) : [],
    }));
  }

  /**
   * Get a user's gamification profile.
   */
  static async getUserProfile(userId: string): Promise<any> {
    const libsql = getTursoClient();
    const res = await libsql.execute({
      sql: `SELECT g.*, u.nombre, u.apellido
        FROM "Gamification" g JOIN "User" u ON g.userId = u.id
        WHERE g.userId = ?`,
      args: [userId],
    });
    if (res.rows.length === 0) return { userId, points: 0, level: 1, badges: [] };
    const row = res.rows[0] as any;
    return { ...row, badges: row.badges ? JSON.parse(row.badges) : [] };
  }

  /**
   * Get all badges (for display).
   */
  static async getAllBadges(): Promise<any[]> {
    const libsql = getTursoClient();
    const res = await libsql.execute({ sql: 'SELECT * FROM "Badge" ORDER BY conditionValue' });
    return res.rows;
  }

  /**
   * Get user progress with level info + next level progress.
   */
  static async getUserProgress(userId: string): Promise<any> {
    const libsql = getTursoClient();
    const res = await libsql.execute({
      sql: 'SELECT points, level, badges FROM "Gamification" WHERE userId = ?',
      args: [userId],
    });
    if (res.rows.length === 0) {
      return { points: 0, level: 1, badges: [], nextLevelPoints: 100, progressToNextLevel: 0 };
    }
    const g = res.rows[0] as any;
    const badges = g.badges ? JSON.parse(g.badges) : [];
    const currentLevelPoints = (Number(g.level) - 1) * 100;
    const nextLevelPoints = Number(g.level) * 100;
    const progressToNextLevel = Math.min(((Number(g.points) - currentLevelPoints) / 100) * 100, 100);
    return {
      points: Number(g.points),
      level: Number(g.level),
      badges,
      nextLevelPoints,
      progressToNextLevel: Math.max(progressToNextLevel, 0),
    };
  }

  /**
   * Get available badges (alias for getAllBadges, matching spec naming).
   */
  static async getAvailableBadges(): Promise<any[]> {
    return this.getAllBadges();
  }
}
