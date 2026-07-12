'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Camera, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { isBlobConfigured } from '@/lib/storage';

// MapPicker uses react-leaflet which requires window → must be client-only (ssr: false)
const MapPicker = dynamic(() => import('@/components/ui/MapPicker').then(m => ({ default: m.MapPicker })), {
  ssr: false,
  loading: () => <div className="h-[300px] rounded-lg border bg-muted/30 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>,
});

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
  const [coverageAreas, setCoverageAreas] = useState<string[]>([]);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const blobEnabled = isBlobConfigured();

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
        setAvatarUrl(u.avatarUrl ?? null);
        setCoverageAreas(u.coverageAreas ? (typeof u.coverageAreas === 'string' ? JSON.parse(u.coverageAreas) : u.coverageAreas) : []);
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
      const payload: any = { ...form, latitude: lat, longitude: lng, coverageAreas };
      if (isEdit && !form.password) delete payload.password;
      const url = isEdit ? `/api/admin/users/${userId}` : '/api/admin/users';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // After successful create/update, upload avatar if a new file was selected.
      // - Edit mode: avatar may have been uploaded immediately on file select (with userId).
      // - New mode: we couldn't upload before (user didn't exist), so upload now with the new id.
      if (avatarFile && !isEdit && data.id) {
        try {
          const fd = new FormData();
          fd.append('file', avatarFile);
          fd.append('userId', data.id);
          const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
          if (!upRes.ok) {
            const upData = await upRes.json();
            toast.warning(`Vendedor creado pero el avatar falló: ${upData.error}`);
          }
        } catch {
          toast.warning('Vendedor creado pero el avatar falló al subir');
        }
      }

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
        {/* Foto de perfil */}
        <Card>
          <CardHeader><CardTitle className="text-base">📸 Foto de perfil</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative group flex-shrink-0">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-hominis-blue to-hominis-violet flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{(form.nombre[0] || '?') + (form.apellido?.[0] || '')}</span>
                  )}
                </div>
                {blobEnabled && (
                  <button
                    type="button"
                    onClick={() => document.getElementById('avatar-input')?.click()}
                    disabled={avatarUploading}
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white disabled:cursor-not-allowed"
                  >
                    {avatarUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                  </button>
                )}
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (!f.type.startsWith('image/')) { toast.error('Debe ser una imagen'); return; }
                    if (f.size > 5 * 1024 * 1024) { toast.error('Máximo 5MB'); return; }
                    setAvatarFile(f);
                    // Show local preview immediately
                    setAvatarUrl(URL.createObjectURL(f));
                    // In edit mode, upload right away (user already exists).
                    // In new mode, defer upload until after create (see submit()).
                    if (isEdit && userId) {
                      setAvatarUploading(true);
                      try {
                        const fd = new FormData();
                        fd.append('file', f);
                        fd.append('userId', userId);
                        const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
                        const upData = await upRes.json();
                        if (!upRes.ok) throw new Error(upData.error);
                        setAvatarUrl(upData.url);
                        setAvatarFile(null); // already uploaded
                        toast.success('Foto actualizada');
                      } catch (err: any) {
                        toast.error(err.message || 'Error al subir foto');
                        setAvatarUrl(null);
                        setAvatarFile(null);
                      } finally { setAvatarUploading(false); }
                    } else {
                      toast.info('La foto se subirá al crear el vendedor');
                    }
                  }}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                {blobEnabled ? (
                  <>
                    <p>Hacé clic en la imagen para subir una foto.</p>
                    <p className="text-xs mt-1">JPG, PNG o WebP · máx 5MB</p>
                    {!isEdit && <p className="text-xs mt-2 text-amber-600">La foto se guardará después de crear el vendedor.</p>}
                  </>
                ) : (
                  <p className="flex items-center gap-1 text-amber-600"><AlertCircle className="w-4 h-4" /> Upload no configurado (Vercel Blob). Se usan iniciales como fallback.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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
            {/* Coverage areas */}
            <div className="space-y-1.5">
              <Label>Zonas de cobertura</Label>
              <div className="flex flex-wrap gap-2">
                {['CABA', 'GBA_NORTE', 'GBA_SUR', 'GBA_OESTE', 'INTERIOR'].map((zona) => (
                  <button
                    key={zona}
                    type="button"
                    onClick={() => {
                      setCoverageAreas(prev => prev.includes(zona) ? prev.filter(z => z !== zona) : [...prev, zona]);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      coverageAreas.includes(zona)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70'
                    }`}
                  >
                    {zona.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Seleccioná las zonas donde este vendedor puede recibir leads</p>
            </div>
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
