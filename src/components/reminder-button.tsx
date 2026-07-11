'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Bell, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReminderButtonProps {
  contactId: string;
  contactName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
}

const TYPE_LABELS: Record<string, string> = {
  CALL: '📞 Llamada',
  EMAIL: '✉️ Email',
  MEETING: '🤝 Reunión',
  OTHER: '📌 Otro',
};

export function ReminderButton({ contactId, contactName, variant = 'outline', size = 'sm' }: ReminderButtonProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    reminderDate: '',
    title: '',
    description: '',
    type: 'CALL',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reminderDate || !form.title) {
      toast.error('Fecha y título son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId,
          reminderDate: new Date(form.reminderDate).toISOString(),
          title: form.title,
          description: form.description,
          type: form.type,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Recordatorio creado');
      setForm({ reminderDate: '', title: '', description: '', type: 'CALL' });
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Default reminder: tomorrow at 10am
  const defaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-1.5">
          <Bell className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Recordatorio</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>⏰ Agendar recordatorio</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">Para: <strong>{contactName}</strong></p>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reminderDate">Fecha y hora *</Label>
            <Input
              id="reminderDate"
              type="datetime-local"
              value={form.reminderDate}
              onChange={(e) => setForm({ ...form, reminderDate: e.target.value })}
              required
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => setForm({ ...form, reminderDate: defaultDate() })} className="text-xs h-7">
              Mañana 10:00
            </Button>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ej: Llamar para confirmar reunión"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              rows={2}
              placeholder="Notas adicionales..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear recordatorio'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
