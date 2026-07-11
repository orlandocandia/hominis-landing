// Shared TypeScript types for the Hominis CRM
// These mirror the Prisma schema enums + DB row shapes used across the app.

// ─── Enums (mirror prisma/schema.prisma) ───
export type Rol = 'ADMIN' | 'VENDEDOR' | 'PRODUCTOR';
export type GeocodingStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type PhoneType = 'PERSONAL' | 'LABORAL' | 'WHATSAPP' | 'URGENCIAS' | 'OTRO';
export type EmailType = 'PERSONAL' | 'LABORAL' | 'ALTERNATIVO' | 'OTRO';
export type SocialPlatform = 'INSTAGRAM' | 'FACEBOOK' | 'LINKEDIN' | 'TWITTER' | 'TIKTOK' | 'YOUTUBE' | 'TELEGRAM' | 'DISCORD' | 'SNAPCHAT' | 'OTRO';
export type ContactSegment = 'RECIBO_DE_SUELDO' | 'MONOTRIBUTO' | 'PARTICULAR';
export type ContactCoverage = 'CABA' | 'GBA';
export type ContactStatus = 'NUEVO' | 'LEIDO' | 'ATENDIDO' | 'RECHAZADO';
export type ActivityAction = 'CREADO' | 'LEIDO' | 'ATENDIDO' | 'RECHAZADO' | 'NOTA' | 'LLAMADA' | 'WHATSAPP' | 'EMAIL' | 'VISITA';
export type AssignmentMethod = 'ROUND_ROBIN' | 'GEOGRAPHIC' | 'CAPACITY' | 'MANUAL';
export type NotificationType = 'CONTACT' | 'ASSIGNMENT' | 'REMINDER' | 'SYSTEM';
export type InvitationRole = 'VENDEDOR' | 'PRODUCTOR';

// ─── DB row shapes (returned by libsql) ───
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string | null;
  telefono: string | null;
  rol: Rol;
  activo: number | boolean;
  fechaAlta: string;
  ultimoAcceso: string | null;
  avatarUrl: string | null;
  avatarPublicId: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  geocodingStatus: GeocodingStatus;
  serviceRadius: number;
  totalContacts: number;
  conversionRate: number;
}

export interface Contact {
  id: string;
  name: string;
  primaryEmail: string | null;
  primaryPhone: string | null;
  address: string;
  city: string | null;
  province: string | null;
  latitude: number;
  longitude: number;
  geocodingStatus: GeocodingStatus;
  segment: ContactSegment | null;
  age: number | null;
  coverage: ContactCoverage | null;
  message: string | null;
  status: ContactStatus;
  ownerId: string;
  assignedBy: string | null;
  assignedAt: string;
  lastContact: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactActivity {
  id: string;
  contactId: string;
  userId: string;
  action: ActivityAction;
  note: string | null;
  metadata: string | null;
  createdAt: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: InvitationRole;
  token: string;
  invitedBy: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean | number;
  link: string | null;
  createdAt: string;
}

// ─── Helper types ───
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Rol;
}

export interface AssignmentResult {
  userId: string;
  userName: string;
  method: AssignmentMethod;
  distanceKm?: number;
  reason: string;
}

export const ROLE_LABELS: Record<Rol, string> = {
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
  PRODUCTOR: 'Productor',
};

export const STATUS_LABELS: Record<ContactStatus, string> = {
  NUEVO: 'Nuevo',
  LEIDO: 'Leído',
  ATENDIDO: 'Atendido',
  RECHAZADO: 'Rechazado',
};

export const SEGMENT_LABELS: Record<ContactSegment, string> = {
  RECIBO_DE_SUELDO: 'Recibo de Sueldo',
  MONOTRIBUTO: 'Monotributo',
  PARTICULAR: 'Particular',
};
