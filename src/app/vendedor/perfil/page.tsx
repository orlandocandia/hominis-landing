'use client'

import { useState, useEffect, useRef } from 'react'
import { User, Lock, Save, Camera, MapPin, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { PROVINCIAS_ARGENTINA } from '@/lib/provincias'

export default function PerfilPage() {
  const [profile, setProfile] = useState({
    nombre: '', apellido: '', email: '', telefono: '', avatarUrl: '',
    // NUEVO: campos logisticos (excepto dni y fechaIngreso que son admin-only)
    province: '', city: '', address: '', horario: '',
  })
  const [latLng, setLatLng] = useState<{ lat: string | number; lng: string | number }>({ lat: '', lng: '' })
  const [loading, setLoading] = useState(true)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  // Foto (preservado)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/vendedor/perfil').then(r => r.ok ? r.json() : null).then(data => {
      if (data) {
        setProfile({
          nombre: data.nombre || '', apellido: data.apellido || '',
          email: data.email || '', telefono: data.telefono || '',
          avatarUrl: data.avatarUrl || '',
          // NUEVO
          province: data.province || '', city: data.city || '',
          address: data.address || '', horario: data.horario || '',
        })
        setAvatarUrl(data.avatarUrl || null)  // foto (preservado)
        setLatLng({
          lat: data.latitude ?? '',
          lng: data.longitude ?? '',
        })
      }
    }).finally(() => setLoading(false))
  }, [])

  // Foto (preservado)
  async function handleFileSelect(file: File) {
    if (!file) return
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)$/)) {
      toast.error('Formato no soportado. Usá JPG, PNG, WEBP o GIF.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagen demasiado grande. Máximo 2MB.')
      return
    }
    setUploadingAvatar(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string
        try {
          const res = await fetch('/api/admin/upload', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataUrl }),
          })
          if (res.ok) {
            const data = await res.json()
            const updateRes = await fetch('/api/vendedor/perfil', {
              method: 'PATCH', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ avatarUrl: data.url }),
            })
            if (updateRes.ok) {
              setAvatarUrl(data.url)
              toast.success('Foto de perfil actualizada')
            } else { toast.error('Error al guardar foto') }
          } else {
            const err = await res.json()
            toast.error(err.error || 'Error al subir foto')
          }
        } catch { toast.error('Error al subir foto') }
        finally { setUploadingAvatar(false) }
      }
      reader.readAsDataURL(file)
    } catch { toast.error('Error al leer archivo'); setUploadingAvatar(false) }
  }

  // NUEVO: geocodificación
  async function geocodificar() {
    if (!profile.province && !profile.city && !profile.address) return
    setGeocoding(true)
    try {
      const res = await fetch('/api/admin/geocode', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provincia: profile.province, ciudad: profile.city, direccion: profile.address }),
      })
      const data = await res.json()
      if (data.lat && data.lng) {
        setLatLng({ lat: data.lat, lng: data.lng })
        toast.success(`Geocodificado: ${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`)
      } else {
        toast.warning('No se encontró la dirección exacta')
      }
    } catch { toast.error('Error al geocodificar') }
    finally { setGeocoding(false) }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await fetch('/api/vendedor/perfil', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: profile.nombre, apellido: profile.apellido,
          telefono: profile.telefono, avatarUrl,
          // NUEVO: campos logisticos (excepto dni y fechaIngreso que son admin-only)
          province: profile.province || null,
          city: profile.city || null,
          address: profile.address || null,
          horario: profile.horario || null,
          latitude: latLng.lat !== '' ? Number(latLng.lat) : null,
          longitude: latLng.lng !== '' ? Number(latLng.lng) : null,
        }),
      })
      if (res.ok) toast.success('Perfil actualizado')
      else toast.error('Error al guardar')
    } catch { toast.error('Error de conexión') }
    finally { setSavingProfile(false) }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return }
    setSavingPassword(true)
    try {
      const res = await fetch('/api/vendedor/perfil', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (res.ok) { toast.success('Contraseña cambiada'); setCurrentPassword(''); setNewPassword('') }
      else { const err = await res.json(); toast.error(err.error || 'Error') }
    } catch { toast.error('Error de conexión') }
    finally { setSavingPassword(false) }
  }

  if (loading) return <div className="py-12 text-center text-muted-foreground">Cargando...</div>

  const initials = `${profile.nombre[0] || ''}${(profile.apellido?.[0] || '')}`.toUpperCase()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Mi Perfil</h1>
      <p className="text-sm text-muted-foreground mb-6">Gestiona tus datos y contraseña</p>

      <div className="max-w-md space-y-6">
        {/* Foto (preservado) */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Camera className="h-5 w-5" />Foto de perfil</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border">
                <AvatarImage src={avatarUrl || undefined} alt={profile.nombre} />
                <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} className="hidden" />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}>
                  <Camera className="h-4 w-4 mr-2" />{uploadingAvatar ? 'Subiendo...' : (avatarUrl ? 'Cambiar foto' : 'Subir foto')}
                </Button>
                {avatarUrl && (
                  <Button type="button" variant="ghost" size="sm" onClick={async () => {
                    setAvatarUrl(null)
                    await fetch('/api/vendedor/perfil', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatarUrl: null }) })
                    toast.success('Foto eliminada')
                  }} className="ml-2 text-red-600">Quitar</Button>
                )}
                <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WEBP. Máx 500KB.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datos personales (preservado) */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5" />Datos personales</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="space-y-2"><Label>Nombre</Label><Input value={profile.nombre} onChange={(e) => setProfile({ ...profile, nombre: e.target.value })} /></div>
              <div className="space-y-2"><Label>Apellido</Label><Input value={profile.apellido} onChange={(e) => setProfile({ ...profile, apellido: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={profile.email} disabled className="opacity-60" /></div>
              <div className="space-y-2"><Label>Teléfono</Label><Input value={profile.telefono} onChange={(e) => setProfile({ ...profile, telefono: e.target.value })} /></div>

              {/* === NUEVO: Datos de logística === */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Datos de logística</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Provincia</Label>
                    <Select value={profile.province || '_none'} onValueChange={(v) => setProfile({ ...profile, province: v === '_none' ? '' : v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar provincia" /></SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        <SelectItem value="_none">— Sin provincia —</SelectItem>
                        {PROVINCIAS_ARGENTINA.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Ciudad</Label><Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} placeholder="Posadas" /></div>
                  <div className="space-y-2">
                    <Label>Dirección</Label>
                    <div className="flex gap-2">
                      <Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} placeholder="Av. Santa Fe 1234" onBlur={geocodificar} />
                      <Button type="button" variant="outline" size="sm" onClick={geocodificar} disabled={geocoding}>
                        {geocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                      </Button>
                    </div>
                    {latLng.lat !== '' && latLng.lng !== '' && (
                      <p className="text-xs text-muted-foreground">📍 {latLng.lat}, {latLng.lng}</p>
                    )}
                  </div>
                  <div className="space-y-2"><Label>Horario de trabajo</Label><Input value={profile.horario} onChange={(e) => setProfile({ ...profile, horario: e.target.value })} placeholder="Lun-Vie 9-18" /></div>
                  <p className="text-xs text-muted-foreground">DNI y fecha de ingreso son editados por el administrador.</p>
                </div>
              </div>

              <Button type="submit" disabled={savingProfile}><Save className="h-4 w-4 mr-2" />{savingProfile ? 'Guardando...' : 'Guardar cambios'}</Button>
            </form>
          </CardContent>
        </Card>

        {/* Cambiar contraseña (preservado) */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Lock className="h-5 w-5" />Cambiar contraseña</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              <div className="space-y-2"><Label>Contraseña actual</Label><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Nueva contraseña</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} /></div>
              <Button type="submit" disabled={savingPassword}><Lock className="h-4 w-4 mr-2" />{savingPassword ? 'Cambiando...' : 'Cambiar contraseña'}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
