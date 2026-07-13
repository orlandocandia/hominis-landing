'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Loader2, CheckCircle2, Clock, XCircle, Play } from 'lucide-react';
import { toast } from 'sonner';

const TIPO_ICONS: Record<string, string> = {
  VISITA: '📍', LLAMADA: '📞', WHATSAPP: '💬', EMAIL: '✉️', REUNION: '🤝', TAREA: '📋',
};

const ESTADO_STYLES: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  EN_PROGRESO: 'bg-blue-100 text-blue-700',
  COMPLETADA: 'bg-green-100 text-green-700',
  CANCELADA: 'bg-gray-100 text-gray-600',
};

// Sentinel values for Radix Select (cannot use empty string "")
const ALL = '__all__';
const NONE = '__none__';

interface Tarea {
  id: string; titulo: string; descripcion: string | null; tipo: string; estado: string;
  fechaLimite: string; fechaCompletada: string | null; asignadoA: string;
  vendedorNombre: string | null; vendedorApellido: string | null;
  contactoName: string | null; contactoPhone: string | null;
}

export default function AdminTareasPage() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState(ALL);
  const [filtroVendedor, setFiltroVendedor] = useState(ALL);
  const [form, setForm] = useState({
    titulo: '', descripcion: '', tipo: 'TAREA', asignadoA: '',
    fechaLimite: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    contactoId: NONE,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroEstado !== ALL) params.set('estado', filtroEstado);
      if (filtroVendedor !== ALL) params.set('vendedorId', filtroVendedor);
      const [tareasRes, vendorsRes, contactsRes] = await Promise.all([
        fetch(`/api/tareas?${params}`),
        fetch('/api/admin/users'),
        fetch('/api/crm/contacts?limit=100'),
      ]);
      const tareasData = await tareasRes.json();
      const vendorsData = await vendorsRes.json();
      const contactsData = await contactsRes.json();
      setTareas(tareasData.tareas || []);
      setVendors(vendorsData.users || []);
      setContacts(contactsData.contacts || []);
    } catch { toast.error('Error al cargar tareas'); }
    finally { setLoading(false); }
  }, [filtroEstado, filtroVendedor]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo || !form.asignadoA) { toast.error('Título y vendedor son obligatorios'); return; }
    setSaving(true);
    try {
      const payload = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        tipo: form.tipo,
        asignadoA: form.asignadoA,
        fechaLimite: form.fechaLimite,
        contactoId: form.contactoId === NONE ? '' : form.contactoId,
      };
      const res = await fetch('/api/tareas', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Tarea creada y asignada');
      setShowForm(false);
      setForm({ titulo: '', descripcion: '', tipo: 'TAREA', asignadoA: '', fechaLimite: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), contactoId: NONE });
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const cambiarEstado = async (id: string, estado: string) => {
    try {
      const res = await fetch(`/api/tareas/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado }) });
      if (!res.ok) throw new Error('Error');
      toast.success(`Tarea marcada como ${estado}`);
      load();
    } catch { toast.error('Error al actualizar'); }
  };

  const eliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    try {
      await fetch(`/api/tareas/${id}`, { method: 'DELETE' });
      toast.success('Tarea eliminada');
      load();
    } catch { toast.error('Error al eliminar'); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const pendientes = tareas.filter(t => t.estado !== 'COMPLETADA' && t.estado !== 'CANCELADA').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">📋 Tareas</h1>
          <p className="text-sm text-muted-foreground">{pendientes} pendientes de {tareas.length} totales</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> {showForm ? 'Cancelar' : 'Nueva Tarea'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Todos los estados" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="PENDIENTE">⏳ Pendiente</SelectItem>
            <SelectItem value="EN_PROGRESO">🔄 En Progreso</SelectItem>
            <SelectItem value="COMPLETADA">✅ Completada</SelectItem>
            <SelectItem value="CANCELADA">❌ Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroVendedor} onValueChange={setFiltroVendedor}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Todos los vendedores" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            {vendors.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.nombre} {v.apellido || ''}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Nueva Tarea</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Título *</Label>
                <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required placeholder="Ej: Visitar a María González" />
              </div>
              <div className="space-y-1.5">
                <Label>Descripción</Label>
                <Textarea rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Detalles de la tarea..." />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIPO_ICONS).map(([k, v]) => <SelectItem key={k} value={k}>{v} {k}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Asignar a *</Label>
                  <Select value={form.asignadoA} onValueChange={(v) => setForm({ ...form, asignadoA: v })}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                    <SelectContent>
                      {vendors.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.nombre} {v.apellido || ''} ({v.rol})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Fecha límite *</Label>
                  <Input type="datetime-local" value={form.fechaLimite} onChange={(e) => setForm({ ...form, fechaLimite: e.target.value })} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Contacto (opcional)</Label>
                  <Select value={form.contactoId} onValueChange={(v) => setForm({ ...form, contactoId: v })}>
                    <SelectTrigger><SelectValue placeholder="Ninguno" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Ninguno</SelectItem>
                      {contacts.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.primaryPhone || 'sin teléfono'})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Tarea'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {tareas.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <p className="text-4xl mb-3">📭</p>
          <p>No hay tareas. Creá una nueva para asignar a tus vendedores.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {tareas.map((t) => (
            <Card key={t.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-start justify-between p-4 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl">{TIPO_ICONS[t.tipo] || '📋'}</span>
                    <span className="font-medium text-sm">{t.titulo}</span>
                    <Badge className={`text-[10px] py-0 ${ESTADO_STYLES[t.estado] || ''}`}>{t.estado}</Badge>
                  </div>
                  {t.descripcion && <p className="text-xs text-muted-foreground mt-1">{t.descripcion}</p>}
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    <span>👤 {t.vendedorNombre} {t.vendedorApellido || ''}</span>
                    {t.contactoName && <span>📱 {t.contactoName}</span>}
                    <span>📅 {new Date(t.fechaLimite).toLocaleString('es-AR')}</span>
                    {t.fechaCompletada && <span>✅ {new Date(t.fechaCompletada).toLocaleDateString('es-AR')}</span>}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {t.estado === 'PENDIENTE' && (
                    <Button size="sm" variant="ghost" onClick={() => cambiarEstado(t.id, 'EN_PROGRESO')} className="h-8 w-8 p-0" title="En Progreso"><Play className="w-3.5 h-3.5" /></Button>
                  )}
                  {t.estado !== 'COMPLETADA' && t.estado !== 'CANCELADA' && (
                    <Button size="sm" variant="ghost" onClick={() => cambiarEstado(t.id, 'COMPLETADA')} className="h-8 w-8 p-0 text-green-600" title="Completar"><CheckCircle2 className="w-3.5 h-3.5" /></Button>
                  )}
                  {t.estado === 'PENDIENTE' && (
                    <Button size="sm" variant="ghost" onClick={() => cambiarEstado(t.id, 'CANCELADA')} className="h-8 w-8 p-0 text-red-500" title="Cancelar"><XCircle className="w-3.5 h-3.5" /></Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => eliminar(t.id)} className="h-8 w-8 p-0 text-muted-foreground" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
