// src/lib/login-attempts.ts — Bloqueo por intentos fallidos (in-memory)
// 5 intentos máximos, bloqueo de 15 minutos, reset a las 24 horas

interface AttemptRecord {
  attempts: number;
  firstAttempt: Date;
  blockedUntil: Date | null;
}

const attemptsMap = new Map<string, AttemptRecord>();

const MAX_ATTEMPTS = 5;
const BLOCK_TIME_MINUTES = 15;
const RESET_HOURS = 24;

function getKey(email: string, ip: string): string {
  return `attempt:${email}:${ip}`;
}

export function checkLoginAttempts(
  email: string,
  ip: string
): { allowed: boolean; remaining: number; blockedUntil: Date | null } {
  const key = getKey(email, ip);
  const record = attemptsMap.get(key);
  const now = new Date();

  if (!record) {
    attemptsMap.set(key, { attempts: 0, firstAttempt: now, blockedUntil: null });
    return { allowed: true, remaining: MAX_ATTEMPTS, blockedUntil: null };
  }

  // Si está bloqueado
  if (record.blockedUntil && record.blockedUntil > now) {
    return { allowed: false, remaining: 0, blockedUntil: record.blockedUntil };
  }

  // Si pasó más de 24 horas, resetear
  const hoursSinceFirst = (now.getTime() - record.firstAttempt.getTime()) / (1000 * 60 * 60);
  if (hoursSinceFirst > RESET_HOURS) {
    attemptsMap.set(key, { attempts: 0, firstAttempt: now, blockedUntil: null });
    return { allowed: true, remaining: MAX_ATTEMPTS, blockedUntil: null };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.attempts);
  return { allowed: remaining > 0, remaining, blockedUntil: null };
}

export function recordFailedAttempt(
  email: string,
  ip: string
): { blocked: boolean; blockedUntil: Date | null } {
  const key = getKey(email, ip);
  const record = attemptsMap.get(key);
  const now = new Date();

  if (!record) {
    attemptsMap.set(key, { attempts: 1, firstAttempt: now, blockedUntil: null });
    return { blocked: false, blockedUntil: null };
  }

  const newAttempts = record.attempts + 1;

  if (newAttempts >= MAX_ATTEMPTS) {
    const blockedUntil = new Date(now.getTime() + BLOCK_TIME_MINUTES * 60 * 1000);
    attemptsMap.set(key, { ...record, attempts: newAttempts, blockedUntil });
    return { blocked: true, blockedUntil };
  }

  attemptsMap.set(key, { ...record, attempts: newAttempts });
  return { blocked: false, blockedUntil: null };
}

export function resetLoginAttempts(email: string, ip: string): void {
  const key = getKey(email, ip);
  attemptsMap.delete(key);
}
