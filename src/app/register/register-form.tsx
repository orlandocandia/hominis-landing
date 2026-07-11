'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'submitting' | 'done'>('loading');
  const [invitation, setInvitation] = useState<{ email: string; role: string; expiresAt: string } | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ nombre: '', apellido: '', password: '', phone: '', address: '' });

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setError('Falta el token de invitación. Necesitás un link válido enviado por email.');
      return;
    }
    fetch(`/api/invitations/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.valid) {
          setInvitation({ email: d.email, role: d.role, expiresAt: d.expiresAt });
          setStatus('valid');
        } else {
          setError(d.error || 'Token inválido');
          setStatus('invalid');
        }
      })
      .catch(() => { setError('Error de conexión'); setStatus('invalid'); });
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.password) {
      setError('Nombre y contraseña son obligatorios');
      return;
    }
    setStatus('submitting');
    setError('');
    try {
      const res = await fetch(`/api/invitations/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus('done');
      setTimeout(() => router.push('/login'), 2000);
    } catch (e: any) {
      setError(e.message);
      setStatus('valid');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hominis-gradient">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hominis-gradient p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Invitación inválida</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button asChild variant="outline"><Link href="/">Volver al sitio</Link></Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hominis-gradient p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">¡Registro completado!</h1>
            <p className="text-muted-foreground mb-6">Tu cuenta fue creada como <strong>{invitation?.role}</strong>. Redirigiendo al login...</p>
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hominis-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-20 right-10 w-72 h-72 bg-hominis-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-hominis-purple/10 rounded-full blur-3xl" />
      <div className="w-full max-w-md relative z-10">
        <a href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver al sitio
        </a>
        <Card className="border-0 shadow-2xl shadow-black/20 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-hominis-blue to-hominis-violet p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">Completar registro</h1>
            <p className="text-white/70 text-sm mt-2">
              Rol: <strong className="text-white">{invitation?.role}</strong> · {invitation?.email}
            </p>
          </div>
          <CardContent className="p-8">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input id="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required disabled={status === 'submitting'} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input id="apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} disabled={status === 'submitting'} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña *</Label>
                <Input id="password" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required disabled={status === 'submitting'} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                <Input id="phone" placeholder="+54 9 11 1234-5678" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} disabled={status === 'submitting'} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Dirección (opcional, para asignación geográfica)</Label>
                <Input id="address" placeholder="Calle 123, Ciudad" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} disabled={status === 'submitting'} />
              </div>
              <Button type="submit" disabled={status === 'submitting'} className="w-full h-12 bg-gradient-to-r from-hominis-blue to-hominis-violet hover:from-hominis-indigo hover:to-hominis-purple text-white font-semibold rounded-xl">
                {status === 'submitting' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Crear mi cuenta'}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-4">
              El email (<strong>{invitation?.email}</strong>) no se puede cambiar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
