'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        toast.success('📧 Revisá tu email para restablecer la contraseña');
      } else {
        toast.error(data.error || 'Error al procesar la solicitud');
      }
    } catch {
      toast.error('Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-card p-6 shadow-lg sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">🔐 Recuperar contraseña</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Ingresá tu email y te enviaremos un link para restablecerla
            </p>
          </div>

          {success ? (
            <div className="py-6 text-center">
              <p className="font-medium text-green-600">✅ Email enviado</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Revisá tu casilla de correo y seguí las instrucciones.
                El link expira en 1 hora.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-block text-primary hover:underline"
              >
                Volver al inicio de sesión →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                ) : (
                  'Enviar link de recuperación'
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
