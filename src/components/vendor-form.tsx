'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { MapPicker } from '@/components/ui/MapPicker';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface VendorFormProps {
  userId?: string; // if provided → edit mode
}

export function VendorForm({ userId }: VendorFormProps) {
  const router = useRouter();
  const isEdit = !!userId;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', password: '', rol: 'VENDEDOR',
    phone: '', address: '', city: '', province: '', serviceRadius: 50,
  });
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        const u = data.user;
        setForm({
          nombre: u.nombre || '', apellido: u.apellido || '', email: u.email || '',
          password: '', rol: u.rol || 'VENDEDOR',
          phone: data.phones?.[0]?.phoneNumber || '',
          address: u.address || '', city: u.city || '', province: u.province || '',
          serviceRadius: u.serviceRadius || 50,
        });
        setLat(u.latitude ?? null);
        setLng(u.longitude ?? null);
      } catch (e: any) {
        toast.error(e.message || 'Error al cargar');
        router.push('/admin/vendedores');
      } finally { setLoading(false); }
    })();
  }, [userId, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.rol) {
      toast.error('Nombre, email y rol son obligatorios');
      return;
    }
    if (!isEdit && !form.password) {
      toast.error('La contraseña es obligatoria');
      return;
    }
    setSaving(true);
    try {
      const payload: any = { ...form, latitude: lat, longitude: lng };
      if (isEdit && !form.password) delete payload.password;
      const url = isEdit ? `/api/admin/users/${userId}` : '/api/admin/users';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(isEdit ? 'Vendedor actualizado' : 'Vendedor creado');
      router.push('/admin/vendedores');
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/admin/vendedores"><ArrowLeft className="w-4 h-4" /></Link></Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEdit ? 'Editar vendedor' : 'Nuevo vendedor'}</h1>
          <p className="text-sm text-muted-foreground">{isEdit ? 'Actualizá los datos del usuario' : 'Creá una cuenta de vendedor o productor'}</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* Datos básicos */}
        <Card>
          <CardHeader><CardTitle className="text-base">Datos básicos</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apellido">Apellido</Label>
              <Input id="apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required disabled={isEdit} />
              {isEdit && <p className="text-xs text-muted-foreground">El email no se puede cambiar.</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rol">Rol *</Label>
              <Select value={form.rol} onValueChange={(v) => setForm({ ...form, rol: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="VENDEDOR">Vendedor</SelectItem>
                  <SelectItem value="PRODUCTOR">Productor (vendedor extendido)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Teléfono / WhatsApp</Label>
              <Input id="phone" placeholder="+54 9 11 1234-5678" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card>
          <CardHeader><CardTitle className="text-base">Ubicación y cobertura</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="address">Dirección (buscar en el mapa o escribir)</Label>
              <Input id="address" placeholder="Portela 266, Lomas de Zamora" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <p className="text-xs text-muted-foreground">Ingresá la dirección y el mapa la geocodificará automáticamente al guardar.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="province">Provincia</Label>
                <Input id="province" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="radius">Radio de cobertura (km)</Label>
                <Input id="radius" type="number" min={1} max={500} value={form.serviceRadius} onChange={(e) => setForm({ ...form, serviceRadius: Number(e.target.value) })} />
              </div>
            </div>
            <MapPicker latitude={lat} longitude={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} address={form.address} />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" asChild><Link href="/admin/vendedores">Cancelar</Link></Button>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Guardar cambios' : 'Crear vendedor'}
          </Button>
        </div>
      </form>
    </div>
  );
}
