'use client';

// /admin/tareas/nueva — Formulario para crear tarea asignada a un vendedor.
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const TIPOS = [
  { value: 'VISITA', label: '📍 Visita' },
  { value: 'LLAMADA', label: '📞 Llamada' },
  { value: 'WHATSAPP', label: '💬 WhatsApp' },
  { value: 'EMAIL', label: '✉️ Email' },
  { value: 'REUNION', label: '🤝 Reunión' },
  { value: 'TAREA', label: '📋 Tarea' },
];

const PRIORIDADES = [
  { value: 'ALTA', label: '🔴 Alta' },
  { value: 'MEDIA', label: '🟡 Media' },
  { value: 'BAJA', label: '🟢 Baja' },
];

const NONE = '__none__'; // sentinel for "no lead" (Radix can't use "")

export default function NuevaTareaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'TAREA',
    prioridad: 'MEDIA',
    fechaLimite: '',
    asignadoA: '',
    contactoId: NONE,
  });

  useEffect(() => {
    fetch('/api/admin/users?limit=50')
      .then((r) => r.json())
      .then((data) => setVendedores(data.users || []))
      .catch(() => {});
    fetch('/api/admin/leads?limit=100')
      .then((r) => r.json())
      .then((data) => setLeads(data.leads || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo || !form.asignadoA) {
      toast.error('Título y vendedor son obligatorios');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        tipo: form.tipo,
        prioridad: form.prioridad,
        fechaLimite: form.fechaLimite || null,
        asignadoA: form.asignadoA,
        contactoId: form.contactoId === NONE ? '' : form.contactoId,
      };
      const res = await fetch('/api/admin/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      toast.success('Tarea creada y notificación enviada');
      router.push('/admin/tareas');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al crear tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Tarea</h1>
          <p className="text-sm text-muted-foreground">Asignar una tarea a un vendedor</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Datos de la tarea</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                required
                placeholder="Ej: Visitar a Juan Pérez"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea
                rows={3}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Detalles de la tarea..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Prioridad</Label>
                <Select value={form.prioridad} onValueChange={(v) => setForm({ ...form, prioridad: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORIDADES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Fecha límite *</Label>
                <Input
                  type="datetime-local"
                  value={form.fechaLimite}
                  onChange={(e) => setForm({ ...form, fechaLimite: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Asignar a *</Label>
                <Select value={form.asignadoA} onValueChange={(v) => setForm({ ...form, asignadoA: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar vendedor..." /></SelectTrigger>
                  <SelectContent>
                    {vendedores.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name} {v.apellido || ''} {v.empresaNombre ? `(${v.empresaNombre})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Lead relacionado (opcional)</Label>
                <Select value={form.contactoId} onValueChange={(v) => setForm({ ...form, contactoId: v })}>
                  <SelectTrigger><SelectValue placeholder="Ninguno" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Ninguno</SelectItem>
                    {leads.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name} {l.telefono ? `- ${l.telefono}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 border-t border-border pt-4">
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Crear Tarea
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
