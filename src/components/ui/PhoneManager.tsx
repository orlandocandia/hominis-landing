'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Star, Phone, MessageCircle, Loader2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Phone {
  id: string;
  phoneNumber: string;
  phoneType: string;
  isPrimary: boolean | number;
  isWhatsapp: boolean | number;
  notes: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  PERSONAL: 'Personal',
  LABORAL: 'Laboral',
  WHATSAPP: 'WhatsApp',
  URGENCIAS: 'Urgencias',
  OTRO: 'Otro',
};

export function PhoneManager() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Phone | null>(null);
  const [form, setForm] = useState({ phoneNumber: '', phoneType: 'PERSONAL', isPrimary: false, isWhatsapp: false, notes: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/profile/phones');
      const data = await res.json();
      setPhones(data.phones || []);
    } catch {
      toast.error('Error al cargar teléfonos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => {
    setForm({ phoneNumber: '', phoneType: 'PERSONAL', isPrimary: false, isWhatsapp: false, notes: '' });
    setEditing(null);
    setShowForm(false);
  };

  const submit = async () => {
    if (!form.phoneNumber || !form.phoneType) return;
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/profile/phones/${editing.id}` : '/api/profile/phones';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(editing ? 'Teléfono actualizado' : 'Teléfono agregado');
      resetForm();
      load();
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este teléfono?')) return;
    try {
      const res = await fetch(`/api/profile/phones/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      toast.success('Teléfono eliminado');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const edit = (p: Phone) => {
    setEditing(p);
    setForm({
      phoneNumber: p.phoneNumber,
      phoneType: p.phoneType,
      isPrimary: !!p.isPrimary,
      isWhatsapp: !!p.isWhatsapp,
      notes: p.notes || '',
    });
    setShowForm(true);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Teléfonos</h3>
        <Button size="sm" variant="outline" onClick={() => { resetForm(); setShowForm(true); }} className="gap-1">
          <Plus className="w-4 h-4" /> Agregar
        </Button>
      </div>

      {showForm && (
        <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Número</Label>
              <Input id="phone" placeholder="+54 9 11 1234-5678" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.phoneType} onValueChange={(v) => setForm({ ...form, phoneType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isPrimary} onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })} className="rounded" />
              Principal
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isWhatsapp} onChange={(e) => setForm({ ...form, isWhatsapp: e.target.checked })} className="rounded" />
              <MessageCircle className="w-4 h-4 text-green-600" /> Es WhatsApp
            </label>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={submit} disabled={saving || !form.phoneNumber}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Guardar' : 'Agregar'}
            </Button>
            <Button size="sm" variant="ghost" onClick={resetForm}>Cancelar</Button>
          </div>
        </div>
      )}

      {phones.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground py-4 text-center">No hay teléfonos cargados.</p>
      )}

      <div className="space-y-2">
        {phones.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                {p.isWhatsapp ? <MessageCircle className="w-4 h-4 text-green-600" /> : <Phone className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate">{p.phoneNumber}</span>
                  {p.isPrimary ? <Badge variant="default" className="text-[10px] py-0 gap-0.5"><Star className="w-2.5 h-2.5" />Principal</Badge> : null}
                  <Badge variant="secondary" className="text-[10px] py-0">{TYPE_LABELS[p.phoneType] || p.phoneType}</Badge>
                </div>
                {p.notes && <p className="text-xs text-muted-foreground truncate">{p.notes}</p>}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button size="sm" variant="ghost" onClick={() => edit(p)} className="h-8 w-8 p-0"><Pencil className="w-3.5 h-3.5" /></Button>
              <Button size="sm" variant="ghost" onClick={() => remove(p.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
