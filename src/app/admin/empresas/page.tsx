'use client';

// /admin/empresas — CRUD de empresas (gestión administrativa).
import { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Edit3, Trash2, Loader2, Mail, Phone, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Empresa {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  isActive: boolean;
}

const EMPTY_FORM = { nombre: '', email: '', telefono: '', direccion: '' };

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchEmpresas = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/empresas', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEmpresas(Array.isArray(data) ? data : data.empresas ?? []);
    } catch {
      toast.error('Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmpresas(); }, [fetchEmpresas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email) {
      toast.error('Nombre y email son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/empresas/${editingId}` : '/api/admin/empresas';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      toast.success(editingId ? 'Empresa actualizada' : 'Empresa creada');
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      fetchEmpresas();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (emp: Empresa) => {
    setEditingId(emp.id);
    setForm({
      nombre: emp.nombre,
      email: emp.email,
      telefono: emp.telefono || '',
      direccion: emp.direccion || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Desactivar la empresa "${nombre}"? Los datos se conservan.`)) return;
    try {
      await fetch(`/api/admin/empresas/${id}`, { method: 'DELETE' });
      toast.success('Empresa desactivada');
      fetchEmpresas();
    } catch {
      toast.error('Error al desactivar');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </span>
            Empresas
          </h1>
          <p className="text-sm text-muted-foreground">{empresas.length} empresas registradas</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(!showForm); }} className="gap-2">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancelar' : 'Nueva Empresa'}
        </Button>
      </div>

      {/* Formulario */}
      {showForm && (
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 font-semibold">{editingId ? 'Editar Empresa' : 'Nueva Empresa'}</h2>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Nombre *</Label>
                <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required placeholder="Ej: Hominis" />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="contacto@empresa.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Teléfono</Label>
                <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="11-5555-1234" />
              </div>
              <div className="space-y-1.5">
                <Label>Dirección</Label>
                <Input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Av. Corrientes 1234" />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editingId ? 'Actualizar' : 'Crear'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-44 w-full rounded-xl" />)}
        </div>
      ) : empresas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Building2 className="h-10 w-10 opacity-50" />
            <p>No hay empresas registradas</p>
            <Button variant="link" onClick={() => setShowForm(true)}>Crear la primera →</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {empresas.map((emp) => (
            <Card key={emp.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold">{emp.nombre}</h3>
                      {emp.isActive ? (
                        <Badge variant="secondary" className="border-transparent bg-emerald-500/15 text-emerald-600">Activa</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-zinc-500">Inactiva</Badge>
                      )}
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2 truncate"><Mail className="h-3.5 w-3.5 shrink-0" /> {emp.email}</p>
                      {emp.telefono && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0" /> {emp.telefono}</p>}
                      {emp.direccion && <p className="flex items-center gap-2 truncate"><MapPin className="h-3.5 w-3.5 shrink-0" /> {emp.direccion}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(emp)} title="Editar">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(emp.id, emp.nombre)} title="Desactivar">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
