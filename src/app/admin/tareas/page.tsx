'use client'

import { useState, useEffect } from 'react'
import { ListTodo, Plus, Search, CheckCircle2, Clock, Trash2, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Tarea {
  id: string
  titulo: string
  descripcion: string | null
  tipo: string
  estado: string
  fechaLimite: string
  contactoId: string | null
  contacto: { id: string; name: string; primaryEmail: string | null; primaryPhone: string | null } | null
  vendedor: { id: string; nombre: string; apellido: string | null; email: string } | null
}

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente', EN_PROGRESO: 'En progreso', COMPLETADA: 'Completada', CANCELADA: 'Cancelada',
}
const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-amber-500/15 text-amber-600', EN_PROGRESO: 'bg-sky-500/15 text-sky-600',
  COMPLETADA: 'bg-emerald-500/15 text-emerald-600', CANCELADA: 'bg-red-500/15 text-red-600',
}

export default function TareasPage() {
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [estado, setEstado] = useState('')
  const [vendedorFiltro, setVendedorFiltro] = useState('')
  const [search, setSearch] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [vendedores, setVendedores] = useState<{ id: string; nombre: string; apellido: string | null }[]>([])
  const [clientes, setClientes] = useState<{ id: string; name: string; primaryEmail: string | null; primaryPhone: string | null }[]>([])
  const [form, setForm] = useState({ titulo: '', descripcion: '', asignadoA: '', fechaLimite: '', tipo: 'LLAMADA', contactoId: '' })
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchTareas(); fetchVendedores(); fetchClientes() }, [estado, vendedorFiltro])

  async function fetchTareas() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (estado) params.set('estado', estado)
      if (vendedorFiltro) params.set('asignadoA', vendedorFiltro)
      const res = await fetch(`/api/admin/tareas?${params}&limit=50`)
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

  async function fetchClientes() {
    try {
      const res = await fetch('/api/admin/clientes')
      if (res.ok) {
        const data = await res.json()
        setClientes(data.clientes || [])
      }
    } catch {}
  }

  // NUEVO: precargar titulo/descripcion al seleccionar un cliente
  function onClienteSelect(clienteId: string) {
    setForm(prev => ({ ...prev, contactoId: clienteId }))
    if (clienteId) {
      const cliente = clientes.find(c => c.id === clienteId)
      if (cliente) {
        // Solo precargar si el titulo esta vacio o era de un cliente anterior
        const wasAutoTitulo = prev.titulo.startsWith('Atender lead:') || prev.titulo.startsWith('Contactar a:') || prev.titulo === ''
        if (wasAutoTitulo) {
          setForm(prev => ({
            ...prev,
            titulo: `Contactar a ${cliente.name}`,
            descripcion: `Llamar a ${cliente.name}${cliente.primaryPhone ? ` (${cliente.primaryPhone})` : ''}${cliente.primaryEmail ? ` - ${cliente.primaryEmail}` : ''}`,
          }))
        }
      }
    } else {
      // Si se deselecciona el cliente, limpiar titulo si era auto-generado
      const wasAuto = form.titulo.startsWith('Contactar a:')
      if (wasAuto) setForm(prev => ({ ...prev, titulo: '', descripcion: '' }))
    }
  }

  function openCreateDialog() {
    setForm({
      titulo: '', descripcion: '', asignadoA: '',
      fechaLimite: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      tipo: 'LLAMADA', contactoId: '',
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo || !form.asignadoA || !form.fechaLimite) {
      toast.error('Faltan campos obligatorios'); return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/tareas', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: form.titulo, descripcion: form.descripcion || undefined,
          tipo: form.tipo, asignadoA: form.asignadoA,
          fechaLimite: form.fechaLimite, contactoId: form.contactoId || undefined,
        }),
      })
      if (res.ok) {
        toast.success('Tarea creada')
        setDialogOpen(false)
        fetchTareas()
      } else { const err = await res.json(); toast.error(err.error || 'Error al crear tarea') }
    } catch { toast.error('Error de conexión') }
    finally { setSaving(false) }
  }

  async function completarTarea(id: string) {
    try {
      const res = await fetch(`/api/admin/tareas/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'COMPLETADA' }),
      })
      if (res.ok) { toast.success('Tarea completada'); fetchTareas() }
      else toast.error('Error al completar')
    } catch { toast.error('Error') }
  }

  async function eliminarTarea(id: string) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/tareas/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Tarea eliminada'); setDeleteTarget(null); fetchTareas() }
      else toast.error('Error al eliminar')
    } catch { toast.error('Error') }
    finally { setDeleting(false) }
  }

  const filtered = search ? tareas.filter(t => t.titulo?.toLowerCase().includes(search.toLowerCase())) : tareas

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Tareas</h1>
          <p className="text-sm text-muted-foreground">Gestión de tareas ({total} total)</p>
        </div>
        <Button onClick={openCreateDialog} size="sm"><Plus className="h-4 w-4 mr-1" /> Nueva tarea</Button>
      </div>

      {/* Filtros */}
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
        <Select value={vendedorFiltro || 'all'} onValueChange={(v) => setVendedorFiltro(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Vendedor" /></SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            <SelectItem value="all">Todos</SelectItem>
            {vendedores.map((v) => <SelectItem key={v.id} value={v.id}>{v.nombre} {v.apellido || ''}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
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
                    <th className="p-3 text-left font-medium hidden md:table-cell">Vendedor</th>
                    <th className="p-3 text-left font-medium hidden lg:table-cell">Cliente</th>
                    <th className="p-3 text-left font-medium hidden sm:table-cell">Fecha límite</th>
                    <th className="p-3 text-left font-medium">Estado</th>
                    <th className="p-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-medium">
                        {t.titulo}
                        {t.descripcion && <p className="text-xs text-muted-foreground truncate max-w-xs">{t.descripcion}</p>}
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">
                        {t.vendedor ? `${t.vendedor.nombre} ${t.vendedor.apellido || ''}` : '—'}
                      </td>
                      <td className="p-3 hidden lg:table-cell text-muted-foreground">
                        {t.contacto ? (
                          <Badge variant="outline" className="text-xs"><User className="h-2.5 w-2.5 mr-0.5" />{t.contacto.name}</Badge>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="p-3 hidden sm:table-cell text-muted-foreground text-xs">
                        {t.fechaLimite ? new Date(t.fechaLimite).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="p-3">
                        <Badge className={`text-xs ${ESTADO_COLORS[t.estado] || 'bg-gray-500/15 text-gray-600'}`}>
                          {ESTADO_LABELS[t.estado] || t.estado}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          {t.estado !== 'COMPLETADA' && (
                            <Button variant="ghost" size="sm" onClick={() => completarTarea(t.id)} title="Completar">
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(t.id)} title="Eliminar" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* === MODAL CREAR TAREA (formulario inteligente) === */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ListTodo className="h-5 w-5" /> Nueva tarea</DialogTitle>
            <DialogDescription>Crea una tarea manual. Asocia un cliente (opcional) para precargar los datos.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cliente asociado (opcional, con busqueda) */}
            <div className="space-y-2">
              <Label>Cliente asociado (opcional)</Label>
              <Select value={form.contactoId || '_none'} onValueChange={onClienteSelect}>
                <SelectTrigger><SelectValue placeholder="Sin cliente (tarea interna)" /></SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  <SelectItem value="_none">— Sin cliente (tarea interna) —</SelectItem>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name} {c.primaryEmail ? `(${c.primaryEmail})` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.contactoId && (
                <p className="text-xs text-muted-foreground">💡 Se precargaron título y descripción con los datos del cliente.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required placeholder="Ej: Llamar al cliente" />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} placeholder="Detalles de la tarea..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Vendedor *</Label>
                <Select value={form.asignadoA} onValueChange={(v) => setForm({ ...form, asignadoA: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar vendedor" /></SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {vendedores.map((v) => <SelectItem key={v.id} value={v.id}>{v.nombre} {v.apellido || ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fecha límite *</Label>
                <Input type="date" value={form.fechaLimite} onChange={(e) => setForm({ ...form, fechaLimite: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo de tarea</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LLAMADA">📞 Llamada</SelectItem>
                  <SelectItem value="WHATSAPP">💬 WhatsApp</SelectItem>
                  <SelectItem value="EMAIL">✉️ Email</SelectItem>
                  <SelectItem value="VISITA">🏠 Visita</SelectItem>
                  <SelectItem value="REUNION">🤝 Reunión</SelectItem>
                  <SelectItem value="TAREA">📋 Tarea</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Creando...' : 'Crear tarea'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* === DIALOG ELIMINAR === */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar tarea</DialogTitle>
            <DialogDescription>¿Estás seguro? Esta acción no se puede deshacer.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteTarget && eliminarTarea(deleteTarget)} disabled={deleting}>
              <Trash2 className="h-4 w-4 mr-2" /> {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
