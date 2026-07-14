'use client';

// /vendedor/perfil — Mi Perfil (ver datos, cambiar nombre, teléfono, contraseña).
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function VendedorPerfilPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', telefono: '', password: '', confirmPassword: '',
  });
  const [empresaNombre, setEmpresaNombre] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/vendedor/perfil', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        setForm({
          name: data.name || '',
          telefono: data.telefono || '',
          password: '',
          confirmPassword: '',
        });
        setEmpresaNombre(data.empresaNombre || null);
      })
      .catch(() => toast.error('Error al cargar perfil'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password && form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/vendedor/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          telefono: form.telefono,
          password: form.password || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      toast.success('Perfil actualizado correctamente');
      // Actualizar sesión para que el nombre cambie en el nav
      await update({ name: form.name });
      setForm({ ...form, password: '', confirmPassword: '' });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">👤 Mi Perfil</h1>
          <p className="text-sm text-muted-foreground">Actualizá tus datos personales</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Datos personales</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre completo</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Tu nombre"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="cursor-not-allowed bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">El email no se puede modificar</p>
            </div>

            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input
                type="tel"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="11-5555-1234"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Empresa</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={empresaNombre || 'Sin empresa'}
                  disabled
                  className="cursor-not-allowed bg-muted text-muted-foreground"
                />
                <Badge variant="secondary">{session?.user?.role}</Badge>
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-4">
              <h3 className="font-semibold">🔒 Cambiar contraseña</h3>
              <div className="space-y-1.5">
                <Label>Nueva contraseña</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="•••••••• (opcional)"
                />
                <p className="text-xs text-muted-foreground">Dejar vacío para mantener la contraseña actual</p>
              </div>
              {form.password && (
                <div className="space-y-1.5">
                  <Label>Confirmar contraseña</Label>
                  <Input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 border-t border-border pt-4">
              <Button type="submit" disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar cambios
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
