// Assignment engine — decides which vendor gets a new contact.
// Methods: ROUND_ROBIN, GEOGRAPHIC (nearest), CAPACITY (least contacts), MANUAL.
import { getTursoClient } from '@/lib/turso-config';
import { distanceKm } from '@/lib/geocoding';
import type { AssignmentMethod } from '@prisma/client';

export interface AssignmentResult {
  userId: string;
  userName: string;
  method: AssignmentMethod;
  distanceKm?: number;
  reason: string;
}

export interface AssignmentOptions {
  method?: AssignmentMethod;
  excludeUserIds?: string[]; // manual exclusion
  contactLat?: number;
  contactLng?: number;
  preferredRole?: 'VENDEDOR' | 'PRODUCTOR';
}

/**
 * Pick the best vendor for a new contact based on the chosen method.
 * Falls back to ROUND_ROBIN if GEOGRAPHIC/CAPACITY can't find a candidate.
 */
export async function assignContact(opts: AssignmentOptions = {}): Promise<AssignmentResult | null> {
  const libsql = getTursoClient();
  const method = opts.method || 'ROUND_ROBIN';

  // Load active vendors/productores
  const roleFilter = opts.preferredRole ? `AND rol = '${opts.preferredRole}'` : '';
  const exclude = opts.excludeUserIds && opts.excludeUserIds.length > 0
    ? `AND id NOT IN (${opts.excludeUserIds.map(() => '?').join(',')})`
    : '';
  const args: any[] = opts.excludeUserIds || [];
  const vendorsRes = await libsql.execute({
    sql: `SELECT id, nombre, apellido, email, rol, latitude, longitude, serviceRadius, totalContacts
      FROM "User" WHERE activo = 1 AND rol IN ('VENDEDOR','PRODUCTOR') ${roleFilter} ${exclude}`,
    args,
  });
  const vendors = vendorsRes.rows as any[];
  if (vendors.length === 0) return null;

  // ─── GEOGRAPHIC: nearest vendor within their service radius ───
  if (method === 'GEOGRAPHIC' && opts.contactLat != null && opts.contactLng != null) {
    const withDistance = vendors
      .filter((v) => v.latitude != null && v.longitude != null)
      .map((v) => ({
        ...v,
        distance: distanceKm(opts.contactLat!, opts.contactLng!, v.latitude, v.longitude),
      }))
      .filter((v) => v.distance <= v.serviceRadius)
      .sort((a, b) => a.distance - b.distance);
    if (withDistance.length > 0) {
      const v = withDistance[0];
      return {
        userId: v.id,
        userName: `${v.nombre} ${v.apellido || ''}`.trim(),
        method: 'GEOGRAPHIC',
        distanceKm: Number(v.distance.toFixed(2)),
        reason: `Vendedor más cercano (${v.distance.toFixed(1)} km, dentro de su radio de ${v.serviceRadius} km)`,
      };
    }
    // No vendor in range → fall through to capacity
  }

  // ─── CAPACITY: vendor with fewest contacts ───
  if (method === 'CAPACITY' || method === 'GEOGRAPHIC') {
    const sorted = [...vendors].sort((a, b) => (a.totalContacts || 0) - (b.totalContacts || 0));
    const v = sorted[0];
    return {
      userId: v.id,
      userName: `${v.nombre} ${v.apellido || ''}`.trim(),
      method: method === 'GEOGRAPHIC' ? 'CAPACITY' : 'CAPACITY',
      reason: method === 'GEOGRAPHIC'
        ? `Sin vendedores en rango geográfico; asignado por capacidad (${v.totalContacts} contactos)`
        : `Vendedor con menor carga (${v.totalContacts} contactos)`,
    };
  }

  // ─── ROUND_ROBIN: last assigned gets the next one (LRU-ish) ───
  // Find vendor who was assigned longest ago (or never).
  const lastAssignedRes = await libsql.execute({
    sql: `SELECT assignedTo, MAX(createdAt) as lastAssigned
      FROM AutomaticAssignment GROUP BY assignedTo`,
  });
  const lastAssigned = new Map<string, string>();
  lastAssignedRes.rows.forEach((r: any) => lastAssigned.set(r.assignedTo, r.lastAssigned));
  const sorted = [...vendors].sort((a, b) => {
    const aT = lastAssigned.get(a.id) ? new Date(lastAssigned.get(a.id)!).getTime() : 0;
    const bT = lastAssigned.get(b.id) ? new Date(lastAssigned.get(b.id)!).getTime() : 0;
    return aT - bT; // oldest first
  });
  const v = sorted[0];
  return {
    userId: v.id,
    userName: `${v.nombre} ${v.apellido || ''}`.trim(),
    method: 'ROUND_ROBIN',
    reason: 'Turno rotativo (round-robin)',
  };
}

/**
 * Record an assignment in the audit table + log a CREADO activity.
 */
export async function recordAssignment(
  contactId: string,
  assignedBy: string,
  result: AssignmentResult
): Promise<void> {
  const libsql = getTursoClient();
  const id = 'asg_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  await libsql.execute({
    sql: `INSERT INTO AutomaticAssignment (id, contactId, assignedTo, method, distanceKm, reason, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    args: [id, contactId, result.userId, result.method, result.distanceKm ?? null, result.reason],
  });
  // Log activity
  const actId = 'act_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  await libsql.execute({
    sql: `INSERT INTO ContactActivity (id, contactId, userId, action, note, createdAt)
      VALUES (?, ?, ?, 'CREADO', ?, CURRENT_TIMESTAMP)`,
    args: [actId, contactId, assignedBy, `Contacto asignado a ${result.userName} (${result.method})`],
  });
}
