'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff, LogIn, ArrowLeft, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        setError('Email o contraseña incorrectos');
        setLoading(false);
        return;
      }

      if (result?.ok) {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        const role = data?.user?.role;
        const dest = role === 'ADMIN' ? '/admin' : role === 'VENDEDOR' ? '/vendedor' : '/admin';
        router.push(dest);
        router.refresh();
      }
    } catch {
      setError('Error de conexión. Intentá nuevamente.');
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hominis CRM</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ingresá tus credenciales para acceder
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@hominis.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            <LogIn className="w-4 h-4 mr-2" />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al sitio
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Suspense fallback={<div className="text-muted-foreground">Cargando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
