'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Search, UserCheck, UserX } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Vendedor {
  id: string
  email: string
  nombre: string
  apellido: string | null
  rol: string
  activo: boolean
  telefono: string | null
  _count: { contacts: number; tareasPendientes: number }
}

export default function VendedoresPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', password: '' })

  useEffect(() => { fetchVendedores() }, [])

  async function fetchVendedores() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users?role=VENDEDOR')
      if (res.ok) setVendedores(await res.json())
    } catch { toast.error('Error al cargar vendedores') }
    finally { setLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, rol: 'VENDEDOR' }),
      })
      if (res.ok) {
        toast.success('Vendedor creado')
        setDialogOpen(false)
        setForm({ nombre: '', apellido: '', email: '', telefono: '', password: '' })
        fetchVendedores()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al crear')
      }
    } catch { toast.error('Error de conexión') }
  }

  async function toggleActivo(v: Vendedor) {
    try {
      await fetch(`/api/admin/users/${v.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !v.activo }),
      })
      toast.success(v.activo ? 'Desactivado' : 'Activado')
      fetchVendedores()
    } catch { toast.error('Error') }
  }

  const filtered = search
    ? vendedores.filter(v => `${v.nombre} ${v.apellido || ''}`.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase()))
    : vendedores

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Vendedores</h1>
          <p className="text-sm text-muted-foreground">Gestión del equipo de ventas</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nuevo vendedor
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar vendedor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-muted-foreground col-span-full text-center py-8">Cargando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" /> No hay vendedores
          </p>
        ) : filtered.map((v) => {
          const initials = `${v.nombre[0] || ''}${(v.apellido?.[0] || '')}`.toUpperCase()
          return (
            <Card key={v.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{v.nombre} {v.apellido}</p>
                    <p className="text-sm text-muted-foreground truncate">{v.email}</p>
                    <Badge variant={v.activo ? 'default' : 'secondary'} className="mt-1 text-xs">
                      {v.activo ? '🟢 Activo' : '🔴 Inactivo'}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 text-center border-t border-border pt-4">
                  <div>
                    <p className="text-xl font-bold">{v._count?.contacts ?? 0}</p>
                    <p className="text-[11px] text-muted-foreground">Leads</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-amber-600">{v._count?.tareasPendientes ?? 0}</p>
                    <p className="text-[11px] text-muted-foreground">Tareas</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-3" onClick={() => toggleActivo(v)}>
                  {v.activo ? <><UserX className="h-4 w-4 mr-1" /> Desactivar</> : <><UserCheck className="h-4 w-4 mr-1" /> Activar</>}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo vendedor</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Apellido</Label>
                <Input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Mínimo 6 caracteres" minLength={6} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Crear vendedor</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
