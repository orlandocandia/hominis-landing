// NextAuth type augmentation
// Adds `role` ('ADMIN' | 'ASESOR') and `id` to Session.user and JWT,
// so they're typed everywhere without manual casts.
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string; // 'ADMIN' | 'ASESOR'
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
