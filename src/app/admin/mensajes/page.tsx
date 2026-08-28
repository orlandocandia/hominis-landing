'use client'

import { useState, useEffect } from 'react'
import { Mail, Search, CheckCircle2, Trash2, Printer, Download, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface Lead {
  id: string
  name: string
  primaryEmail: string | null
  primaryPhone: string | null
  message: string | null
  status: string
  sourceReferrer: string | null
  createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  NUEVO: 'Nuevo', LEIDO: 'Leído', EN_CONTACTO: 'En proceso', REUNION: 'Reunión',
  PRESUPUESTO: 'Presupuesto', ATENDIDO: 'Atendido', RECHAZADO: 'Rechazado',
}

const STATUS_COLORS: Record<string, string> = {
  NUEVO: 'bg-violet-500/15 text-violet-600',
  LEIDO: 'bg-sky-500/15 text-sky-600',
  EN_CONTACTO: 'bg-amber-500/15 text-amber-600',
  ATENDIDO: 'bg-emerald-500/15 text-emerald-600',
  RECHAZADO: 'bg-red-500/15 text-red-600',
}

export default function MensajesPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [estado, setEstado] = useState('')
  const [origen, setOrigen] = useState('')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null) // ID a eliminar (individual)

  useEffect(() => {
    fetchLeads()
  }, [page, estado, origen])

  async function fetchLeads() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (estado) params.set('estado', estado)
      if (origen) params.set('origen', origen)

      const res = await fetch(`/api/admin/leads?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads || [])
        setTotal(data.total || 0)
        setSelectedIds([]) // limpiar seleccion al recargar
      }
    } catch {
      toast.error('Error al cargar mensajes')
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(id: string) {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'LEIDO' }),
      })
      if (res.ok) {
        toast.success('Marcado como leído')
        fetchLeads()
      } else {
        toast.error('Error al actualizar')
      }
    } catch {
      toast.error('Error al actualizar')
    }
  }

  async function deleteLead(id: string) {
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Mensaje eliminado')
        setDeleteTarget(null)
        fetchLeads()
      } else {
        toast.error('Error al eliminar')
      }
    } catch {
      toast.error('Error al eliminar')
    }
  }

  function printLead(id: string) {
    // Abrir vista de impresion en nueva pestaña
    window.open(`/api/admin/leads/${id}/print`, '_blank')
  }

  // === Acciones masivas ===
  function toggleSelect(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  function toggleSelectAll() {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredLeads.map(l => l.id))
    }
  }

  async function bulkMarkRead() {
    if (selectedIds.length === 0) return
    try {
      const res = await fetch('/api/admin/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markRead', ids: selectedIds }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(`${data.affected} mensajes marcados como leídos`)
        fetchLeads()
      } else {
        toast.error('Error en acción masiva')
      }
    } catch {
      toast.error('Error en acción masiva')
    }
  }

  async function bulkDelete() {
    if (selectedIds.length === 0) return
    try {
      const res = await fetch('/api/admin/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', ids: selectedIds }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(`${data.affected} mensajes eliminados`)
        fetchLeads()
      } else {
        toast.error('Error en acción masiva')
      }
    } catch {
      toast.error('Error en acción masiva')
    }
  }

  // === Exportar ===
  function exportData(format: 'excel' | 'pdf' | 'csv') {
    const params = new URLSearchParams()
    if (estado) params.set('estado', estado)
    if (origen) params.set('origen', origen)
    const query = params.toString()
    const url = `/api/admin/leads/export/${format}${query ? `?${query}` : ''}`
    window.open(url, '_blank')
  }

  const filteredLeads = search
    ? leads.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.primaryEmail?.toLowerCase().includes(search.toLowerCase())
      )
    : leads

  const allSelected = filteredLeads.length > 0 && selectedIds.length === filteredLeads.length

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Mensajes</h1>
          <p className="text-sm text-muted-foreground">Bandeja de entrada de leads ({total} total)</p>
        </div>
        {/* Boton Exportar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => exportData('excel')}>
              <Download className="h-4 w-4 mr-2" /> Excel (.xls)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportData('pdf')}>
              <Printer className="h-4 w-4 mr-2" /> PDF (imprimible)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportData('csv')}>
              <Download className="h-4 w-4 mr-2" /> CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 mt-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={estado || 'all'} onValueChange={(v) => { setEstado(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="NUEVO">Nuevos</SelectItem>
            <SelectItem value="LEIDO">Leídos</SelectItem>
            <SelectItem value="EN_CONTACTO">En proceso</SelectItem>
            <SelectItem value="ATENDIDO">Atendidos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={origen || 'all'} onValueChange={(v) => { setOrigen(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Origen" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="landing-hominis">Hominis</SelectItem>
            <SelectItem value="landing-seguros">Cotiza</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Acciones masivas (visibles cuando hay seleccion) */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-muted/30 rounded-lg border">
          <span className="text-sm font-medium">{selectedIds.length} seleccionado(s)</span>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={bulkMarkRead}>
            <CheckCircle2 className="h-4 w-4 mr-1" /> Marcar leídos
          </Button>
          <Button variant="destructive" size="sm" onClick={bulkDelete}>
            <Trash2 className="h-4 w-4 mr-1" /> Eliminar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>Cancelar</Button>
        </div>
      )}

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Cargando...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No hay mensajes
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="p-3 text-left font-medium w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 cursor-pointer"
                        aria-label="Seleccionar todos"
                      />
                    </th>
                    <th className="p-3 text-left font-medium">Nombre</th>
                    <th className="p-3 text-left font-medium hidden md:table-cell">Email</th>
                    <th className="p-3 text-left font-medium hidden lg:table-cell">Teléfono</th>
                    <th className="p-3 text-left font-medium">Origen</th>
                    <th className="p-3 text-left font-medium">Estado</th>
                    <th className="p-3 text-left font-medium hidden md:table-cell">Fecha</th>
                    <th className="p-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(lead.id)}
                          onChange={() => toggleSelect(lead.id)}
                          className="h-4 w-4 cursor-pointer"
                          aria-label={`Seleccionar ${lead.name}`}
                        />
                      </td>
                      <td className="p-3 font-medium">{lead.name}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">{lead.primaryEmail || '—'}</td>
                      <td className="p-3 hidden lg:table-cell text-muted-foreground">{lead.primaryPhone || '—'}</td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-xs">
                          {lead.sourceReferrer === 'landing-hominis' ? 'Hominis' :
                           lead.sourceReferrer === 'landing-seguros' ? 'Cotiza' : 'Directo'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={`text-xs ${STATUS_COLORS[lead.status] || 'bg-gray-500/15 text-gray-600'}`}>
                          {STATUS_LABELS[lead.status] || lead.status}
                        </Badge>
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">
                        {new Date(lead.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          {lead.status === 'NUEVO' && (
                            <Button variant="ghost" size="sm" onClick={() => markAsRead(lead.id)} title="Marcar como leído">
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => printLead(lead.id)} title="Imprimir">
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(lead.id)} title="Eliminar" className="text-red-600 hover:text-red-700 hover:bg-red-50">
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

      {/* Paginación */}
      {total > 20 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Página {page} de {Math.ceil(total / 20)}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Dialog de confirmacion de eliminacion */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar mensaje</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este lead? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => deleteTarget && deleteLead(deleteTarget)}>
              <Trash2 className="h-4 w-4 mr-2" /> Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
