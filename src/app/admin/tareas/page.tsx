'use client'

import { useState, useEffect } from 'react'
import { ListTodo, Plus, Search, CheckCircle2, Clock, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Tarea {
  id: string
  titulo: string
  descripcion: string | null
  tipo: string
  estado: string
  fechaLimite: string
  vendedor: { id: string; nombre: string; apellido: string | null; email: string } | null
}

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROGRESO: 'En progreso',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
}

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-amber-500/15 text-amber-600',
  EN_PROGRESO: 'bg-sky-500/15 text-sky-600',
  COMPLETADA: 'bg-emerald-500/15 text-emerald-600',
  CANCELADA: 'bg-red-500/15 text-red-600',
}

export default function TareasPage() {
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [estado, setEstado] = useState('')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [vendedores, setVendedores] = useState<{ id: string; nombre: string; apellido: string | null }[]>([])
  const [form, setForm] = useState({ titulo: '', descripcion: '', asignadoA: '', fechaLimite: '' })

  useEffect(() => {
    fetchTareas()
    fetchVendedores()
  }, [estado])

  async function fetchTareas() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (estado) params.set('estado', estado)
      const res = await fetch(`/api/admin/tareas?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTareas(data.tareas || [])
        setTotal(data.total || 0)
      }
    } catch { toast.error('Error al cargar tareas') }
    finally { setLoading(false) }
  }

  async function fetchVendedores() {
    try {
      const res = await fetch('/api/admin/users?role=VENDEDOR')
      if (res.ok) setVendedores(await res.json())
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success('Tarea creada')
        setDialogOpen(false)
        setForm({ titulo: '', descripcion: '', asignadoA: '', fechaLimite: '' })
        fetchTareas()
      } else {
        toast.error('Error al crear tarea')
      }
    } catch { toast.error('Error de conexión') }
  }

  async function completarTarea(id: string) {
    try {
      await fetch(`/api/admin/tareas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'COMPLETADA' }),
      })
      toast.success('Tarea completada')
      fetchTareas()
    } catch { toast.error('Error') }
  }

  const filtered = search
    ? tareas.filter(t => t.titulo.toLowerCase().includes(search.toLowerCase()) || t.vendedor?.nombre.toLowerCase().includes(search.toLowerCase()))
    : tareas

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Tareas</h1>
          <p className="text-sm text-muted-foreground">Gestión de tareas del equipo ({total} total)</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nueva tarea
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar tarea..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={estado || 'all'} onValueChange={(v) => setEstado(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="PENDIENTE">Pendientes</SelectItem>
            <SelectItem value="EN_PROGRESO">En progreso</SelectItem>
            <SelectItem value="COMPLETADA">Completadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-50" /> No hay tareas
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="p-3 text-left font-medium">Título</th>
                    <th className="p-3 text-left font-medium hidden md:table-cell">Asignado a</th>
                    <th className="p-3 text-left font-medium hidden lg:table-cell">Vence</th>
                    <th className="p-3 text-left font-medium">Estado</th>
                    <th className="p-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b border-border hover:bg-muted/20">
                      <td className="p-3 font-medium">{t.titulo}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">
                        {t.vendedor ? `${t.vendedor.nombre} ${t.vendedor.apellido || ''}` : '—'}
                      </td>
                      <td className="p-3 hidden lg:table-cell text-muted-foreground text-xs">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {new Date(t.fechaLimite).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="p-3">
                        <Badge className={`text-xs ${ESTADO_COLORS[t.estado] || ''}`}>
                          {ESTADO_LABELS[t.estado] || t.estado}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        {t.estado !== 'COMPLETADA' && (
                          <Button variant="ghost" size="sm" onClick={() => completarTarea(t.id)}>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          </Button>
                        )}
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
          <DialogHeader><DialogTitle>Nueva tarea</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Asignar a</Label>
              <Select value={form.asignadoA} onValueChange={(v) => setForm({ ...form, asignadoA: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar vendedor" /></SelectTrigger>
                <SelectContent>
                  {vendedores.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.nombre} {v.apellido || ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha límite</Label>
              <Input type="date" value={form.fechaLimite} onChange={(e) => setForm({ ...form, fechaLimite: e.target.value })} required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Crear tarea</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
