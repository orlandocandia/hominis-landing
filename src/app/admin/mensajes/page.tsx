'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, Search, Filter, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  NUEVO: 'Nuevo',
  LEIDO: 'Leído',
  EN_CONTACTO: 'En proceso',
  REUNION: 'Reunión',
  PRESUPUESTO: 'Presupuesto',
  ATENDIDO: 'Atendido',
  RECHAZADO: 'Rechazado',
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
      }
    } catch {
      toast.error('Error al cargar mensajes')
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(id: string) {
    try {
      await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'LEIDO' }),
      })
      toast.success('Marcado como leído')
      fetchLeads()
    } catch {
      toast.error('Error al actualizar')
    }
  }

  const filteredLeads = search
    ? leads.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.primaryEmail?.toLowerCase().includes(search.toLowerCase())
      )
    : leads

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Mensajes</h1>
      <p className="text-sm text-muted-foreground mb-4">Bandeja de entrada de leads ({total} total)</p>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
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
                      <td className="p-3 text-right">
                        {lead.status === 'NUEVO' && (
                          <Button variant="ghost" size="sm" onClick={() => markAsRead(lead.id)}>
                            <CheckCircle2 className="h-4 w-4" />
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
    </div>
  )
}
