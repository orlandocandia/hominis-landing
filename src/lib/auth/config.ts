// NextAuth Configuration - Uses raw SQL via Turso (no Prisma dependency)
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getTursoClient } from '@/lib/turso-config';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son obligatorios');
        }

        const libsql = getTursoClient();
        const email = credentials.email.toLowerCase().trim();

        const result = await libsql.execute({
          sql: 'SELECT * FROM User WHERE email = ? LIMIT 1',
          args: [email],
        });

        if (result.rows.length === 0) {
          throw new Error('Credenciales inválidas');
        }

        const user = result.rows[0];

        if (!Number(user.activo)) {
          throw new Error('Tu cuenta está desactivada. Contactá al administrador.');
        }

        if (user.bloqueadoHasta && new Date() < new Date(user.bloqueadoHasta as string)) {
          const remaining = Math.ceil(
            (new Date(user.bloqueadoHasta as string).getTime() - Date.now()) / 60000
          );
          throw new Error(`Cuenta bloqueada por demasiados intentos. Intentá en ${remaining} minutos.`);
        }

        const isValid = await bcrypt.compare(credentials.password, user.password as string);

        if (!isValid) {
          const newAttempts = Number(user.intentosLogin) + 1;
          const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;

          await libsql.execute({
            sql: 'UPDATE User SET intentosLogin = ?, bloqueadoHasta = ? WHERE id = ?',
            args: [
              newAttempts,
              shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000).toISOString() : null,
              user.id,
            ],
          });

          if (shouldLock) {
            throw new Error(`Cuenta bloqueada por ${LOCKOUT_MINUTES} minutos debido a demasiados intentos fallidos.`);
          }

          throw new Error(`Credenciales inválidas. Intentos restantes: ${MAX_LOGIN_ATTEMPTS - newAttempts}`);
        }

        await libsql.execute({
          sql: 'UPDATE User SET intentosLogin = 0, bloqueadoHasta = NULL, ultimoLogin = ? WHERE id = ?',
          args: [new Date().toISOString(), user.id],
        });

        return {
          id: user.id as string,
          email: user.email as string,
          name: user.nombre as string,
          role: user.rol as string,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
  },
  jwt: {
    maxAge: 8 * 60 * 60,
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.includes('/login') || url === baseUrl) {
        return `${baseUrl}/dashboard`;
      }
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === new URL(baseUrl).origin) return url;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'hominis-agustina-candia-2025-secret-key-secure',
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: { sameSite: 'lax', path: '/', secure: false },
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
    },
  },
};
