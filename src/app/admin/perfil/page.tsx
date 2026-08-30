'use client'

import { useState, useEffect } from 'react'
import { User, Lock, Save, Eye, EyeOff, Mail, Shield } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

export default function AdminPerfilPage() {
  const [profile, setProfile] = useState({ nombre: '', email: '', avatarUrl: '' })
  const [loading, setLoading] = useState(true)

  // Cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    fetch('/api/admin/perfil').then(r => r.ok ? r.json() : null).then(data => {
      if (data) {
        setProfile({ nombre: data.nombre || '', email: data.email || '', avatarUrl: data.avatarUrl || '' })
      }
    }).finally(() => setLoading(false))
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await fetch('/api/admin/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: profile.nombre }),
      })
      if (res.ok) toast.success('Perfil actualizado')
      else { const err = await res.json(); toast.error(err.error || 'Error al guardar') }
    } catch { toast.error('Error de conexión') }
    finally { setSavingProfile(false) }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return }
    if (newPassword !== confirmPassword) { toast.error('Las contraseñas no coinciden'); return }
    setSavingPassword(true)
    try {
      const res = await fetch('/api/admin/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (res.ok) {
        toast.success('Contraseña actualizada')
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al cambiar contraseña')
      }
    } catch { toast.error('Error de conexión') }
    finally { setSavingPassword(false) }
  }

  if (loading) return <div className="py-12 text-center text-muted-foreground">Cargando...</div>

  const initials = profile.nombre ? profile.nombre[0].toUpperCase() : 'A'

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Mi Perfil</h1>
      <p className="text-sm text-muted-foreground mb-6">Gestiona tu cuenta de administrador</p>

      <div className="max-w-md space-y-6">
        {/* Card de datos personales */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5" />Datos personales</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-32 w-32 border">
                <AvatarImage src={profile.avatarUrl || undefined} alt={profile.nombre} />
                <AvatarFallback className="bg-primary/10 text-2xl font-bold text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Cuenta de administrador</p>
              </div>
            </div>

            <form onSubmit={saveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={profile.nombre} onChange={(e) => setProfile({ ...profile, nombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile.email} disabled className="opacity-60" />
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Este email es el correo funcional del sistema y no puede ser modificado.
                </p>
              </div>
              <Button type="submit" disabled={savingProfile}><Save className="h-4 w-4 mr-2" />{savingProfile ? 'Guardando...' : 'Guardar cambios'}</Button>
            </form>
          </CardContent>
        </Card>

        {/* Card de cambio de contraseña */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Lock className="h-5 w-5" />Cambiar contraseña</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              {/* Contraseña actual */}
              <div className="space-y-2">
                <Label>Contraseña actual *</Label>
                <div className="relative">
                  <Input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Tu contraseña actual"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showCurrent ? 'Ocultar' : 'Mostrar'}
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Nueva contraseña */}
              <div className="space-y-2">
                <Label>Nueva contraseña *</Label>
                <div className="relative">
                  <Input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showNew ? 'Ocultar' : 'Mostrar'}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div className="space-y-2">
                <Label>Confirmar nueva contraseña *</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repetir la nueva contraseña"
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Validación visual */}
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-600">⚠ Las contraseñas no coinciden</p>
                )}
                {confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                  <p className="text-xs text-emerald-600">✓ Las contraseñas coinciden</p>
                )}
              </div>

              <Button type="submit" disabled={savingPassword || !currentPassword || newPassword.length < 6 || newPassword !== confirmPassword}>
                <Lock className="h-4 w-4 mr-2" /> {savingPassword ? 'Guardando...' : 'Cambiar contraseña'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
