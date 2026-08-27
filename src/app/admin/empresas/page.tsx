'use client'

import { useState, useEffect } from 'react'
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Empresa {
  id: string
  nombre: string
  email: string
  telefono: string | null
  isActive: boolean
}

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Empresa | null>(null)
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '' })

  useEffect(() => {
    fetchEmpresas()
  }, [])

  async function fetchEmpresas() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/empresas')
      if (res.ok) setEmpresas(await res.json())
    } catch {
      toast.error('Error al cargar empresas')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditing(null)
    setForm({ nombre: '', email: '', telefono: '' })
    setDialogOpen(true)
  }

  function openEdit(emp: Empresa) {
    setEditing(emp)
    setForm({ nombre: emp.nombre, email: emp.email, telefono: emp.telefono || '' })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editing) {
        await fetch(`/api/admin/empresas/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        toast.success('Empresa actualizada')
      } else {
        await fetch('/api/admin/empresas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        toast.success('Empresa creada')
      }
      setDialogOpen(false)
      fetchEmpresas()
    } catch {
      toast.error('Error al guardar')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta empresa?')) return
    try {
      await fetch(`/api/admin/empresas/${id}`, { method: 'DELETE' })
      toast.success('Empresa eliminada')
      fetchEmpresas()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Empresas</h1>
          <p className="text-sm text-muted-foreground">Gestión de empresas del sistema</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Nueva empresa
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Cargando...</div>
          ) : empresas.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No hay empresas
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="p-3 text-left font-medium">Nombre</th>
                    <th className="p-3 text-left font-medium hidden md:table-cell">Email</th>
                    <th className="p-3 text-left font-medium hidden md:table-cell">Teléfono</th>
                    <th className="p-3 text-left font-medium">Estado</th>
                    <th className="p-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empresas.map((emp) => (
                    <tr key={emp.id} className="border-b border-border hover:bg-muted/20">
                      <td className="p-3 font-medium">{emp.nombre}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">{emp.email || '—'}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">{emp.telefono || '—'}</td>
                      <td className="p-3">
                        <Badge variant={emp.isActive ? 'default' : 'secondary'} className="text-xs">
                          {emp.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(emp)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(emp.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar empresa' : 'Nueva empresa'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">{editing ? 'Guardar' : 'Crear'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
