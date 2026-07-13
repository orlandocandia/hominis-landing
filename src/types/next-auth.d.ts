// NextAuth type augmentation
// Adds `role` ('ADMIN' | 'VENDEDOR'), `id`, `empresaId`, `empresaNombre` to Session.user and JWT.
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string; // 'ADMIN' | 'VENDEDOR'
      empresaId?: string | null;
      empresaNombre?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: string;
    empresaId?: string | null;
    empresaNombre?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    empresaId?: string | null;
    empresaNombre?: string | null;
  }
}
