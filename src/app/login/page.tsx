'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff, LogIn, ArrowLeft, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector, useTranslation } from '@/components/language-selector';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        await new Promise((r) => setTimeout(r, 300));
        try {
          const res = await fetch('/api/auth/session');
          const data = await res.json();
          const role = data?.user?.role;
          const dest =
            role === 'ADMIN'
              ? '/admin'
              : role === 'VENDEDOR'
                ? '/vendedor'
                : '/login';
          window.location.href = dest;
        } catch {
          window.location.href = '/login';
        }
      }
    } catch {
      setError('Error de conexión. Intentá nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hominis-gradient dark:bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-hominis-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-hominis-purple/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-hominis-accent/5 rounded-full blur-3xl" />

      {/* Theme + Language toggle (top right) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to site link */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors dark:text-muted-foreground dark:hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('auth.login.back') || 'Volver al sitio'}
        </a>

        <Card className="border-0 shadow-2xl shadow-black/20 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-hominis-blue to-hominis-violet p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">
              {t('auth.login.title') || 'Panel de Gestión'}
            </h1>
            <p className="text-white/70 text-sm mt-2">
              {t('auth.login.subtitle') || 'Ingresá tus credenciales para acceder al dashboard'}
            </p>
          </div>

          <CardContent className="p-8">
            {/* Error alert */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t('auth.login.email') || 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 rounded-xl"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t('auth.login.password') || 'Contraseña'}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="h-12 rounded-xl pr-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full h-12 bg-gradient-to-r from-hominis-blue to-hominis-violet hover:from-hominis-indigo hover:to-hominis-purple text-white font-semibold rounded-xl shadow-lg shadow-hominis-violet/25 transition-all text-base"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Ingresando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    {t('auth.login.submit') || 'Ingresar'}
                  </div>
                )}
              </Button>
            </form>

            {/* Security note */}
            <div className="mt-6 p-4 bg-hominis-gradient-subtle rounded-xl">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                🔒 Acceso exclusivo para personal autorizado. Las credenciales son
                encriptadas y protegidas. Si no tenés cuenta, contactá al administrador.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6">
          Hominis — Panel de Gestión © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

