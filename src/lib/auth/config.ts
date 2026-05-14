// NextAuth Configuration
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getNextauthSecret } from '@/lib/turso-config';

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

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user) {
          throw new Error('Credenciales inválidas');
        }

        // Check if user is active
        if (!user.activo) {
          throw new Error('Tu cuenta está desactivada. Contactá al administrador.');
        }

        // Check if account is locked
        if (user.bloqueadoHasta && new Date() < user.bloqueadoHasta) {
          const remaining = Math.ceil(
            (user.bloqueadoHasta.getTime() - Date.now()) / 60000
          );
          throw new Error(
            `Cuenta bloqueada por demasiados intentos. Intentá en ${remaining} minutos.`
          );
        }

        // Verify password
        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          // Increment failed attempts
          const newAttempts = user.intentosLogin + 1;
          const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;

          await db.user.update({
            where: { id: user.id },
            data: {
              intentosLogin: newAttempts,
              bloqueadoHasta: shouldLock
                ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
                : null,
            },
          });

          if (shouldLock) {
            throw new Error(
              `Cuenta bloqueada por ${LOCKOUT_MINUTES} minutos debido a demasiados intentos fallidos.`
            );
          }

          throw new Error(
            `Credenciales inválidas. Intentos restantes: ${MAX_LOGIN_ATTEMPTS - newAttempts}`
          );
        }

        // Reset failed attempts and update last login
        await db.user.update({
          where: { id: user.id },
          data: {
            intentosLogin: 0,
            bloqueadoHasta: null,
            ultimoLogin: new Date(),
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.nombre,
          role: user.rol,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
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
      // After login, redirect to dashboard instead of the default callback URL
      if (url.includes('/login') || url === baseUrl) {
        return `${baseUrl}/dashboard`;
      }
      // If url is relative, prepend base
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // If url is on same domain, allow it
      if (new URL(url).origin === new URL(baseUrl).origin) return url;
      return baseUrl;
    },
  },
  secret: getNextauthSecret(),
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false,
      },
    },
  },
};
