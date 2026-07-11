// POST /api/upload — avatar upload
// Body (multipart): file=File, userId?=string (admin uploading for another user)
// If userId omitted → uploads for the current session user (self-service profile).
// If userId provided → requires ADMIN role, uploads for that target user.
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { uploadAvatar } from '@/lib/storage';
import { getTursoClient } from '@/lib/turso-config';

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: 'Se requiere multipart/form-data con un campo "file"' }, { status: 400 });
    }
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'Archivo no proporcionado' }, { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Debe ser una imagen' }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Máximo 5MB' }, { status: 400 });

    // Determine target user: optional userId param (admin only), defaults to self
    const targetUserId = (formData.get('userId') as string) || session.user.id;
    if (targetUserId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: solo admin puede subir avatares para otros usuarios' }, { status: 403 });
    }

    const { url, publicId } = await uploadAvatar(file, targetUserId);
    const libsql = getTursoClient();
    await libsql.execute({
      sql: 'UPDATE User SET avatarUrl = ?, avatarPublicId = ?, avatarUpdatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      args: [url, publicId, targetUserId],
    });
    return NextResponse.json({ url, publicId, userId: targetUserId });
  } catch (e: any) {
    console.error('[upload] error:', e);
    return NextResponse.json(
      { error: e.message?.includes('BLOB') ? 'Upload no configurado. Contactá al admin.' : 'Error al subir imagen' },
      { status: 500 }
    );
  }
}
