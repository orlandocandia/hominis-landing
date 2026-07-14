'use client';

// /admin/vendedores/nuevo — Formulario para crear vendedor.
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Empresa {
  id: string;
  nombre: string;
  isActive: number | boolean;
}

export default function NuevoVendedorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    telefono: '',
    empresaId: '',
  });

  useEffect(() => {
    fetch('/api/admin/empresas', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: Empresa[]) => {
        // Solo mostrar empresas activas
        const activas = (Array.isArray(data) ? data : []).filter((e) => e.isActive !== 0 && e.isActive !== false);
        setEmpresas(activas);
      })
      .catch(() => toast.error('Error al cargar empresas'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.password || !form.empresaId) {
      toast.error('Todos los campos marcados con * son obligatorios');
      return;
    }
    if (form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      toast.success('Vendedor creado correctamente');
      router.push('/admin/vendedores');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al crear vendedor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Vendedor</h1>
          <p className="text-sm text-muted-foreground">Crear un nuevo vendedor y asignarlo a una empresa</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Datos del vendedor</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nombre completo *</Label>
                <Input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                  placeholder="Juan Pérez"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="juan@empresa.com"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Contraseña *</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="••••••••"
                />
                <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
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
            </div>

            <div className="space-y-1.5">
              <Label>Empresa *</Label>
              <Select value={form.empresaId} onValueChange={(v) => setForm({ ...form, empresaId: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar empresa..." /></SelectTrigger>
                <SelectContent>
                  {empresas.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">El vendedor solo verá datos de esta empresa</p>
            </div>

            <div className="flex gap-3 border-t border-border pt-4">
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Crear Vendedor
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
