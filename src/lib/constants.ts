// Shared constants for the CRM.

/**
 * Valid status transitions for the sales pipeline.
 * Keys are source statuses, values are arrays of allowed target statuses.
 * ATENDIDO and RECHAZADO are terminal (no outgoing transitions).
 * RECHAZADO can be reactivated back to EN_CONTACTO (give leads a second chance).
 */
export const VALID_TRANSITIONS: Record<string, string[]> = {
  NUEVO: ['LEIDO', 'RECHAZADO'],
  LEIDO: ['EN_CONTACTO', 'RECHAZADO'],
  EN_CONTACTO: ['REUNION', 'RECHAZADO'],
  REUNION: ['PRESUPUESTO', 'RECHAZADO'],
  PRESUPUESTO: ['ATENDIDO', 'RECHAZADO'],
  ATENDIDO: [], // terminal — sale closed
  RECHAZADO: ['EN_CONTACTO'], // can reactivate
};

/**
 * Check if a status transition is valid.
 * ADMIN/PRODUCTOR can bypass the restriction (they can move to any state).
 */
export function isValidTransition(
  fromStatus: string,
  toStatus: string,
  userRole?: string
): boolean {
  if (fromStatus === toStatus) return false;
  // Admin and productor can move freely
  if (userRole === 'ADMIN' || userRole === 'PRODUCTOR') return true;
  const allowed = VALID_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

export const PIPELINE_STATUSES = [
  { id: 'NUEVO', label: '🆕 Nuevos', color: 'bg-red-50 border-red-200', headerColor: 'text-red-700', badge: 'bg-red-100 text-red-700', description: 'Leads recién ingresados' },
  { id: 'LEIDO', label: '📖 Leídos', color: 'bg-yellow-50 border-yellow-200', headerColor: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', description: 'Contacto revisado' },
  { id: 'EN_CONTACTO', label: '💬 En Contacto', color: 'bg-blue-50 border-blue-200', headerColor: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', description: 'En conversación' },
  { id: 'REUNION', label: '🤝 Reunión', color: 'bg-purple-50 border-purple-200', headerColor: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', description: 'Reunión agendada' },
  { id: 'PRESUPUESTO', label: '💰 Presupuesto', color: 'bg-orange-50 border-orange-200', headerColor: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', description: 'Cotización enviada' },
  { id: 'ATENDIDO', label: '✅ Cerrado', color: 'bg-green-50 border-green-200', headerColor: 'text-green-700', badge: 'bg-green-100 text-green-700', description: 'Venta cerrada' },
  { id: 'RECHAZADO', label: '❌ Rechazado', color: 'bg-gray-50 border-gray-200', headerColor: 'text-gray-600', badge: 'bg-gray-100 text-gray-600', description: 'Lead perdido' },
] as const;
