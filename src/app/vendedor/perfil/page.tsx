'use client'

import { useState, useEffect } from 'react'
import { User, Lock, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function PerfilPage() {
  const [profile, setProfile] = useState({ nombre: '', apellido: '', email: '', telefono: '' })
  const [loading, setLoading] = useState(true)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    fetch('/api/vendedor/perfil').then(r => r.ok ? r.json() : null).then(data => {
      if (data) setProfile({ nombre: data.nombre || '', apellido: data.apellido || '', email: data.email || '', telefono: data.telefono || '' })
    }).finally(() => setLoading(false))
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await fetch('/api/vendedor/perfil', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: profile.nombre, apellido: profile.apellido, telefono: profile.telefono }),
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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Mi Perfil</h1>
      <p className="text-sm text-muted-foreground mb-6">Gestiona tus datos y contraseña</p>

      <div className="max-w-md space-y-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5" />Datos personales</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="space-y-2"><Label>Nombre</Label><Input value={profile.nombre} onChange={(e) => setProfile({ ...profile, nombre: e.target.value })} /></div>
              <div className="space-y-2"><Label>Apellido</Label><Input value={profile.apellido} onChange={(e) => setProfile({ ...profile, apellido: e.target.value })} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={profile.email} disabled className="opacity-60" /></div>
              <div className="space-y-2"><Label>Teléfono</Label><Input value={profile.telefono} onChange={(e) => setProfile({ ...profile, telefono: e.target.value })} /></div>
              <Button type="submit" disabled={savingProfile}><Save className="h-4 w-4 mr-2" />{savingProfile ? 'Guardando...' : 'Guardar cambios'}</Button>
            </form>
          </CardContent>
        </Card>

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
