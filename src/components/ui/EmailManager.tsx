'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Star, Mail, Loader2, Pencil } from 'lucide-react';
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

interface Email {
  id: string;
  email: string;
  emailType: string;
  isPrimary: boolean | number;
  notes: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  PERSONAL: 'Personal',
  LABORAL: 'Laboral',
  ALTERNATIVO: 'Alternativo',
  OTRO: 'Otro',
};

export function EmailManager() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Email | null>(null);
  const [form, setForm] = useState({ email: '', emailType: 'PERSONAL', isPrimary: false, notes: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/profile/emails');
      const data = await res.json();
      setEmails(data.emails || []);
    } catch { toast.error('Error al cargar emails'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm({ email: '', emailType: 'PERSONAL', isPrimary: false, notes: '' }); setEditing(null); setShowForm(false); };

  const submit = async () => {
    if (!form.email || !form.emailType) return;
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/profile/emails/${editing.id}` : '/api/profile/emails';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(editing ? 'Email actualizado' : 'Email agregado');
      resetForm(); load();
    } catch (e: any) { toast.error(e.message || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este email?')) return;
    try {
      const res = await fetch(`/api/profile/emails/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      toast.success('Email eliminado'); load();
    } catch (e: any) { toast.error(e.message); }
  };

  const edit = (e: Email) => {
    setEditing(e);
    setForm({ email: e.email, emailType: e.emailType, isPrimary: !!e.isPrimary, notes: e.notes || '' });
    setShowForm(true);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Emails</h3>
        <Button size="sm" variant="outline" onClick={() => { resetForm(); setShowForm(true); }} className="gap-1">
          <Plus className="w-4 h-4" /> Agregar
        </Button>
      </div>

      {showForm && (
        <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="tu@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.emailType} onValueChange={(v) => setForm({ ...form, emailType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isPrimary} onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })} className="rounded" />
            Principal
          </label>
          <div className="flex gap-2">
            <Button size="sm" onClick={submit} disabled={saving || !form.email}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Guardar' : 'Agregar'}</Button>
            <Button size="sm" variant="ghost" onClick={resetForm}>Cancelar</Button>
          </div>
        </div>
      )}

      {emails.length === 0 && !showForm && <p className="text-sm text-muted-foreground py-4 text-center">No hay emails cargados.</p>}

      <div className="space-y-2">
        {emails.map((e) => (
          <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0"><Mail className="w-4 h-4" /></div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate">{e.email}</span>
                  {e.isPrimary ? <Badge variant="default" className="text-[10px] py-0 gap-0.5"><Star className="w-2.5 h-2.5" />Principal</Badge> : null}
                  <Badge variant="secondary" className="text-[10px] py-0">{TYPE_LABELS[e.emailType] || e.emailType}</Badge>
                </div>
                {e.notes && <p className="text-xs text-muted-foreground truncate">{e.notes}</p>}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Button size="sm" variant="ghost" onClick={() => edit(e)} className="h-8 w-8 p-0"><Pencil className="w-3.5 h-3.5" /></Button>
              <Button size="sm" variant="ghost" onClick={() => remove(e.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
