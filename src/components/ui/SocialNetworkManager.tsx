'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Star, Loader2, Pencil, Instagram, Facebook, Linkedin, Twitter, Youtube, MessageCircle, Users } from 'lucide-react';
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

interface Social {
  id: string;
  platform: string;
  username: string;
  url: string | null;
  isPrimary: boolean | number;
  notes: string | null;
}

const PLATFORMS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  INSTAGRAM: { label: 'Instagram', icon: <Instagram className="w-4 h-4" />, color: 'text-pink-600' },
  FACEBOOK: { label: 'Facebook', icon: <Facebook className="w-4 h-4" />, color: 'text-blue-600' },
  LINKEDIN: { label: 'LinkedIn', icon: <Linkedin className="w-4 h-4" />, color: 'text-blue-700' },
  TWITTER: { label: 'Twitter', icon: <Twitter className="w-4 h-4" />, color: 'text-sky-500' },
  TIKTOK: { label: 'TikTok', icon: <Users className="w-4 h-4" />, color: 'text-black' },
  YOUTUBE: { label: 'YouTube', icon: <Youtube className="w-4 h-4" />, color: 'text-red-600' },
  TELEGRAM: { label: 'Telegram', icon: <MessageCircle className="w-4 h-4" />, color: 'text-blue-500' },
  DISCORD: { label: 'Discord', icon: <Users className="w-4 h-4" />, color: 'text-indigo-600' },
  SNAPCHAT: { label: 'Snapchat', icon: <Users className="w-4 h-4" />, color: 'text-yellow-500' },
  OTRO: { label: 'Otro', icon: <Users className="w-4 h-4" />, color: 'text-gray-600' },
};

export function SocialNetworkManager() {
  const [socials, setSocials] = useState<Social[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Social | null>(null);
  const [form, setForm] = useState({ platform: 'INSTAGRAM', username: '', url: '', isPrimary: false, notes: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/profile/social');
      const data = await res.json();
      setSocials(data.social || []);
    } catch { toast.error('Error al cargar redes sociales'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => { setForm({ platform: 'INSTAGRAM', username: '', url: '', isPrimary: false, notes: '' }); setEditing(null); setShowForm(false); };

  const submit = async () => {
    if (!form.platform || !form.username) return;
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/profile/social/${editing.id}` : '/api/profile/social';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(editing ? 'Red social actualizada' : 'Red social agregada');
      resetForm(); load();
    } catch (e: any) { toast.error(e.message || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar esta red social?')) return;
    try {
      const res = await fetch(`/api/profile/social/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      toast.success('Red social eliminada'); load();
    } catch (e: any) { toast.error(e.message); }
  };

  const edit = (s: Social) => {
    setEditing(s);
    setForm({ platform: s.platform, username: s.username, url: s.url || '', isPrimary: !!s.isPrimary, notes: s.notes || '' });
    setShowForm(true);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Redes Sociales</h3>
        <Button size="sm" variant="outline" onClick={() => { resetForm(); setShowForm(true); }} className="gap-1">
          <Plus className="w-4 h-4" /> Agregar
        </Button>
      </div>

      {showForm && (
        <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Plataforma</Label>
              <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PLATFORMS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" placeholder="@usuario" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="url">URL (opcional)</Label>
            <Input id="url" placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isPrimary} onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })} className="rounded" />
            Principal
          </label>
          <div className="flex gap-2">
            <Button size="sm" onClick={submit} disabled={saving || !form.username}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Guardar' : 'Agregar'}</Button>
            <Button size="sm" variant="ghost" onClick={resetForm}>Cancelar</Button>
          </div>
        </div>
      )}

      {socials.length === 0 && !showForm && <p className="text-sm text-muted-foreground py-4 text-center">No hay redes sociales cargadas.</p>}

      <div className="space-y-2">
        {socials.map((s) => {
          const meta = PLATFORMS[s.platform] || PLATFORMS.OTRO;
          return (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 ${meta.color}`}>{meta.icon}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{s.username}</span>
                    {s.isPrimary ? <Badge variant="default" className="text-[10px] py-0 gap-0.5"><Star className="w-2.5 h-2.5" />Principal</Badge> : null}
                    <Badge variant="secondary" className="text-[10px] py-0">{meta.label}</Badge>
                  </div>
                  {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">{s.url}</a>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button size="sm" variant="ghost" onClick={() => edit(s)} className="h-8 w-8 p-0"><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="ghost" onClick={() => remove(s.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
