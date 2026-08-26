import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH] Intento de login con email:', credentials?.email)

        // 🔥 USUARIO ADMIN HARDCODEADO - SIN BASE DE DATOS
        if (credentials?.email === 'admin@hominis.com' && credentials?.password === 'Hominis2025!') {
          console.log('[AUTH] ✅ Admin autenticado correctamente (hardcodeado)')
          return {
            id: 'admin-hardcodeado',
            email: 'admin@hominis.com',
            name: 'Administrador',
            role: 'ADMIN',
          }
        }

        console.log('[AUTH] ❌ Credenciales inválidas')
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET || 'secret-temporario-para-pruebas',
}
