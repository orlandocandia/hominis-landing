// Auth helper - getServerSession wrapper
import { getServerSession } from 'next-auth/next';
import { authOptions } from './config';

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session?.user) {
    return null;
  }
  return session;
}
