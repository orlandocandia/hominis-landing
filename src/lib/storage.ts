// Storage helper — avatar uploads with automatic fallback.
// If BLOB_READ_WRITE_TOKEN is configured → uses Vercel Blob.
// Otherwise → generates an initials avatar (data URL, no upload needed).
import { put } from '@vercel/blob';

export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

/**
 * Upload an avatar image to Vercel Blob.
 * Returns { url, publicId } or throws if Blob is not configured.
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<{ url: string; publicId: string }> {
  if (!isBlobConfigured()) {
    throw new Error('BLOB_READ_WRITE_TOKEN no configurado');
  }
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const publicId = `avatars/${userId}-${Date.now()}.${ext}`;
  const blob = await put(publicId, file, {
    access: 'public',
    addRandomSuffix: false,
    contentType: file.type || undefined,
  });
  return { url: blob.url, publicId };
}

/**
 * Generate an initials avatar as a data URL (SVG).
 * Used as fallback when Blob is not configured, or for new users without a photo.
 */
export function generateInitialsAvatar(name: string, size = 200): string {
  const initials = name
    .split(' ')
    .map((p) => p.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  // Deterministic color from name
  const colors = [
    ['#6366f1', '#8b5cf6'],
    ['#ec4899', '#f43f5e'],
    ['#10b981', '#059669'],
    ['#f59e0b', '#d97706'],
    ['#3b82f6', '#6366f1'],
    ['#8b5cf6', '#a855f7'],
  ];
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  const [c1, c2] = colors[idx];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
  </linearGradient></defs>
  <rect width="${size}" height="${size}" fill="url(#g)"/>
  <text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${size / 2.5}" font-weight="700" fill="white">${initials}</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Delete a blob by its URL. No-op if Blob is not configured.
 */
export async function deleteAvatar(url: string): Promise<void> {
  if (!isBlobConfigured()) return;
  if (!url.startsWith('http')) return; // data URL or empty — nothing to delete
  try {
    const { del } = await import('@vercel/blob');
    await del(url);
  } catch (e) {
    console.warn('[storage] deleteAvatar failed:', e);
  }
}
