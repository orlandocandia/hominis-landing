// NextAuth Route Handler
// Handles all auth requests: /api/auth/signin, /api/auth/signout, /api/auth/session, etc.
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
