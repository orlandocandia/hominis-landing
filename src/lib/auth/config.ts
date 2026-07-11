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
          sql: 'UPDATE User SET intentosLogin = 0, bloqueadoHasta = NULL, ultimoAcceso = ? WHERE id = ?',
          args: [new Date().toISOString(), user.id],
        });

        return {
          id: user.id as string,
          email: user.email as string,
          name: user.nombre as string,
          role: (user.rol as string) || 'VENDEDOR',
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
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow same-origin relative URLs; default to baseUrl.
      // Role-based routing is handled in the login page after signIn.
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === new URL(baseUrl).origin) return url;
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'hominis-agustina-candia-2025-secret-key-secure',
  // NOTE: Custom cookie config removed to ensure the middleware's withAuth()
  // reads the same cookie name the route handler sets. In production (HTTPS),
  // NextAuth auto-uses the __Secure- prefix consistently everywhere.
};
