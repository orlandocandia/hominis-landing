'use client';
import { useTranslation } from '@/components/language-selector';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Mail, Send, Loader2, Clock, CheckCircle2, XCircle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  invitedByNombre: string | null;
  invitedByApellido: string | null;
}

export default function InvitacionesPage() {
  const { t } = useTranslation();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: '', role: 'VENDEDOR' });
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/invitations');
      const data = await res.json();
      setInvitations(data.invitations || []);
    } catch { toast.error('Error al cargar invitaciones'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) return;
    setSending(true);
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.emailSent
        ? `Invitación enviada a ${form.email} por email`
        : `Invitación creada (email falló — copiá el link manualmente)`);
      setForm({ email: '', role: 'VENDEDOR' });
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally { setSending(false); }
  };

  const copyLink = (id: string, token: string) => {
    const url = `${window.location.origin}/register?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Link copiado al portapapeles');
  };

  const status = (inv: Invitation) => {
    if (inv.usedAt) return { label: 'Usada', icon: <CheckCircle2 className="w-3 h-3" />, variant: 'secondary' as const };
    if (new Date(inv.expiresAt) < new Date()) return { label: 'Expirada', icon: <XCircle className="w-3 h-3" />, variant: 'destructive' as const };
    return { label: 'Pendiente', icon: <Clock className="w-3 h-3" />, variant: 'default' as const };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('admin.invitaciones.title')}</h1>
        <p className="text-sm text-muted-foreground">Invitá vendedores y productores por email</p>
      </div>

      {/* New invitation form */}
      <Card>
        <CardHeader><CardTitle className="text-base">{t('admin.invitaciones.newInvitation')}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-[1fr_180px_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email del invitado</Label>
              <Input id="email" type="email" placeholder="vendedor@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={sending} />
            </div>
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                  <SelectItem value="PRODUCTOR">Productor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={sending || !form.email} className="gap-2 w-full sm:w-auto">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Invitar
              </Button>
            </div>
          </form>
          <p className="text-xs text-muted-foreground mt-3">
            💡 Se enviará un email con un link de registro. La invitación expira en 7 días.
            Si el email falla, podés copiar el link manualmente desde la lista de abajo.
          </p>
        </CardContent>
      </Card>

      {/* Invitations list */}
      <Card>
        <CardHeader><CardTitle className="text-base">{t('admin.invitaciones.title')} enviadas ({invitations.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : invitations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay invitaciones enviadas todavía.</p>
          ) : (
            <div className="space-y-2">
              {invitations.map((inv) => {
                const s = status(inv);
                return (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">{inv.email}</span>
                          <Badge variant="outline" className="text-[10px] py-0">{inv.role}</Badge>
                          <Badge variant={s.variant} className="text-[10px] py-0 gap-0.5">{s.icon}{s.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Invitado por {inv.invitedByNombre} {inv.invitedByApellido || ''} · {new Date(inv.createdAt).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </div>
                    {!inv.usedAt && new Date(inv.expiresAt) > new Date() && (
                      <Button size="sm" variant="ghost" onClick={() => copyLink(inv.id, inv.token)} className="flex-shrink-0 gap-1">
                        {copiedId === inv.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{copiedId === inv.id ? 'Copiado' : 'Link'}</span>
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
