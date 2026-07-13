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
        empresaId: { label: 'Empresa', type: 'text' },
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

        // Multiempresa: resolver empresaId del usuario (si vino en credentials, validarlo; si no, usar el de la DB)
        let userEmpresaId = (user.empresaId as string | null) ?? null;
        let userEmpresaNombre: string | null = null;
        const providedEmpresaId = (credentials as { empresaId?: string }).empresaId;
        if (providedEmpresaId && providedEmpresaId !== 'all') {
          // El usuario seleccionó una empresa en el login — debe coincidir con la suya
          if (userEmpresaId && userEmpresaId !== providedEmpresaId) {
            throw new Error('Este usuario no pertenece a la empresa seleccionada.');
          }
        }
        if (userEmpresaId) {
          const empRes = await libsql.execute({ sql: 'SELECT nombre FROM "Empresa" WHERE id = ?', args: [userEmpresaId] });
          if (empRes.rows.length > 0) {
            userEmpresaNombre = empRes.rows[0].nombre as string;
          }
        }

        return {
          id: user.id as string,
          email: user.email as string,
          name: user.nombre as string,
          role: (user.rol as string) || 'VENDEDOR',
          empresaId: userEmpresaId,
          empresaNombre: userEmpresaNombre,
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
    async jwt({ token, user, trigger, session: updateSession }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.empresaId = (user as { empresaId?: string | null }).empresaId ?? null;
        token.empresaNombre = (user as { empresaNombre?: string | null }).empresaNombre ?? null;
      }
      // Multiempresa: permitir cambiar de empresa activa via useSession().update()
      // Solo ADMIN puede cambiar; VENDEDOR siempre mantiene su empresa fija.
      if (trigger === 'update' && updateSession) {
        const newEmpresaId = (updateSession as { empresaId?: string | null }).empresaId ?? null;
        const newEmpresaNombre = (updateSession as { empresaNombre?: string | null }).empresaNombre ?? null;
        if (token.role === 'ADMIN') {
          token.empresaId = newEmpresaId;
          token.empresaNombre = newEmpresaNombre;
        }
        // VENDEDOR: el cambio se ignora (su empresa es fija)
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.empresaId = (token.empresaId as string | null) ?? null;
        session.user.empresaNombre = (token.empresaNombre as string | null) ?? null;
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


