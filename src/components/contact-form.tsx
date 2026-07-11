'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Plus, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const MapPicker = dynamic(() => import('@/components/ui/MapPicker').then(m => ({ default: m.MapPicker })), {
  ssr: false,
  loading: () => <div className="h-[300px] rounded-lg border bg-muted/30 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>,
});

interface ContactFormProps {
  contactId?: string; // if provided → edit mode
}

const SEGMENTS = [
  { value: 'RECIBO_DE_SUELDO', label: 'Recibo de sueldo' },
  { value: 'MONOTRIBUTO', label: 'Monotributo' },
  { value: 'PARTICULAR', label: 'Particular' },
];
const COVERAGE = [
  { value: 'CABA', label: 'CABA' },
  { value: 'GBA', label: 'GBA' },
];

export function ContactForm({ contactId }: ContactFormProps) {
  const router = useRouter();
  const isEdit = !!contactId;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', primaryEmail: '', primaryPhone: '', address: '',
    segment: '', coverage: '', age: '', message: '',
  });
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [extraPhones, setExtraPhones] = useState<{ phoneNumber: string; phoneType: string; isWhatsapp: boolean }[]>([]);
  const [extraEmails, setExtraEmails] = useState<{ email: string; emailType: string }[]>([]);

  useEffect(() => {
    if (!contactId) return;
    (async () => {
      try {
        const res = await fetch(`/api/crm/contacts/${contactId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const c = data.contact;
        setForm({
          name: c.name || '', primaryEmail: c.primaryEmail || '', primaryPhone: c.primaryPhone || '',
          address: c.address || '', segment: c.segment || '', coverage: c.coverage || '',
          age: c.age ? String(c.age) : '', message: c.message || '',
        });
        setLat(c.latitude ?? null);
        setLng(c.longitude ?? null);
      } catch (e: any) {
        toast.error(e.message || 'Error al cargar');
        router.push('/vendedor/contactos');
      } finally { setLoading(false); }
    })();
  }, [contactId, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address) {
      toast.error('Nombre y dirección son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        age: form.age ? Number(form.age) : null,
        phones: extraPhones.filter(p => p.phoneNumber),
        emails: extraEmails.filter(em => em.email),
        latitude: lat, longitude: lng,
      };
      const url = isEdit ? `/api/crm/contacts/${contactId}` : '/api/crm/contacts';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (!isEdit && data.assignment) {
        toast.success(`Contacto creado y asignado a ${data.assignment.userName} (${data.assignment.method})`);
      } else {
        toast.success(isEdit ? 'Contacto actualizado' : 'Contacto creado');
      }
      router.push('/vendedor/contactos');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/vendedor/contactos"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEdit ? 'Editar contacto' : 'Nuevo contacto'}</h1>
          <p className="text-sm text-muted-foreground">{isEdit ? 'Actualizá los datos del contacto' : 'Se asignará automáticamente al vendedor más adecuado'}</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Datos básicos */}
        <Card>
          <CardHeader><CardTitle className="text-base">Datos del contacto</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Juan Pérez" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="primaryPhone">Teléfono principal</Label>
              <Input id="primaryPhone" placeholder="+54 9 11 1234-5678" value={form.primaryPhone} onChange={(e) => setForm({ ...form, primaryPhone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="primaryEmail">Email principal</Label>
              <Input id="primaryEmail" type="email" placeholder="juan@email.com" value={form.primaryEmail} onChange={(e) => setForm({ ...form, primaryEmail: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="age">Edad</Label>
              <Input id="age" type="number" min={0} max={120} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Segmento</Label>
              <Select value={form.segment} onValueChange={(v) => setForm({ ...form, segment: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>{SEGMENTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cobertura</Label>
              <Select value={form.coverage} onValueChange={(v) => setForm({ ...form, coverage: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>{COVERAGE.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card>
          <CardHeader><CardTitle className="text-base">Ubicación</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="address">Dirección *</Label>
              <Input id="address" placeholder="Calle 123, Ciudad" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              <p className="text-xs text-muted-foreground">La dirección se geocodifica automáticamente para asignar al vendedor más cercano.</p>
            </div>
            <MapPicker latitude={lat} longitude={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} address={form.address} />
          </CardContent>
        </Card>

        {/* Mensaje */}
        <Card>
          <CardHeader><CardTitle className="text-base">Notas / Mensaje</CardTitle></CardHeader>
          <CardContent>
            <Textarea rows={3} placeholder="Información adicional, consultas, etc." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </CardContent>
        </Card>

        {/* Extra multichannel (new contacts only) */}
        {!isEdit && (
          <Card>
            <CardHeader><CardTitle className="text-base">Teléfonos adicionales (opcional)</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {extraPhones.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="+54 9 11 ..." value={p.phoneNumber} onChange={(e) => { const n = [...extraPhones]; n[i].phoneNumber = e.target.value; setExtraPhones(n); }} />
                  <Select value={p.phoneType} onValueChange={(v) => { const n = [...extraPhones]; n[i].phoneType = v; setExtraPhones(n); }}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERSONAL">Personal</SelectItem>
                      <SelectItem value="LABORAL">Laboral</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="OTRO">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setExtraPhones(extraPhones.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setExtraPhones([...extraPhones, { phoneNumber: '', phoneType: 'PERSONAL', isWhatsapp: false }])} className="gap-1">
                <Plus className="w-4 h-4" /> Agregar teléfono
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" asChild><Link href="/vendedor/contactos">Cancelar</Link></Button>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Guardar cambios' : 'Crear contacto'}
          </Button>
        </div>
      </form>
    </div>
  );
}
