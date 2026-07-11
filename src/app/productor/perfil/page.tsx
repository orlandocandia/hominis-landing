// /productor/perfil — productor's own profile (multichannel managers)
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getTursoClient } from '@/lib/turso-config';
import { ProfileContent } from '@/components/profile-content';

export default async function ProductorPerfilPage() {
  const session = await getServerSession(authOptions);
  const libsql = getTursoClient();
  const result = await libsql.execute({
    sql: 'SELECT nombre, email, rol, avatarUrl FROM User WHERE id = ?',
    args: [session!.user.id],
  });
  const u = result.rows[0] as any;
  return <ProfileContent user={{ name: u?.nombre || session?.user?.name || '', email: u?.email || '', role: u?.rol || '', avatarUrl: u?.avatarUrl || null }} />;
}
