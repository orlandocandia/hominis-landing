// Input Sanitization Utility
// Equivalent to PHP htmlspecialchars, strip_tags, filter_input

/**
 * Sanitize string input - remove HTML tags, trim whitespace, normalize unicode
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newline and tab
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Strip HTML tags
    .replace(/<[^>]*>/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Limit length
    .slice(0, 1000);
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== 'string') return '';
  
  const email = input.trim().toLowerCase();
  
  // Basic email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) return '';
  if (email.length > 254) return '';
  
  return email;
}

/**
 * Sanitize phone number - keep only digits, +, -, spaces, parentheses
 */
export function sanitizePhone(input: unknown): string {
  if (typeof input !== 'string') return '';
  
  const phone = input.trim()
    .replace(/[^0-9+\-()\s]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 30);
  
  return phone;
}

/**
 * Validate segment type
 */
export function validateSegmento(input: unknown): string {
  const validSegments = ['PARTICULAR', 'MONOTRIBUTISTA', 'EMPLEADO_DEPENDENCIA'];
  
  if (typeof input !== 'string') return '';
  const upper = input.toUpperCase().trim();
  
  return validSegments.includes(upper) ? upper : '';
}

/**
 * Validate coverage type
 */
export function validateCobertura(input: unknown): string {
  const validCoverages = ['BSAS', 'NACIONAL', 'INTERNACIONAL'];
  
  if (typeof input !== 'string') return '';
  const upper = input.toUpperCase().trim();
  
  return validCoverages.includes(upper) ? upper : '';
}

/**
 * Validate age (must be <= 64)
 */
export function validateAge(input: unknown): number | null {
  if (input === null || input === undefined || input === '') return null;
  
  const age = typeof input === 'string' ? parseInt(input, 10) : 
              typeof input === 'number' ? input : NaN;
  
  if (isNaN(age) || age < 0 || age > 150) return null;
  if (age > 64) return null; // Business rule: max 64 years
  
  return age;
}

/**
 * Escape HTML entities for safe output (XSS prevention)
 */
export function escapeHtml(input: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };
  
  return input.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}
