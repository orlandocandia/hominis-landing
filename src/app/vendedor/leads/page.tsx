'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, Mail, Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface Lead { id: string; name: string; primaryEmail: string | null; primaryPhone: string | null; status: string; sourceReferrer: string | null; createdAt: string }

const STATUS_LABELS: Record<string,string> = { NUEVO: 'Nuevo', LEIDO: 'Leído', EN_CONTACTO: 'En contacto', REUNION: 'Reunión', PRESUPUESTO: 'Presupuesto', ATENDIDO: 'Atendido', RECHAZADO: 'Rechazado' }
const STATUS_COLORS: Record<string,string> = { NUEVO: 'bg-violet-500/15 text-violet-600', LEIDO: 'bg-sky-500/15 text-sky-600', EN_CONTACTO: 'bg-amber-500/15 text-amber-600', ATENDIDO: 'bg-emerald-500/15 text-emerald-600', RECHAZADO: 'bg-red-500/15 text-red-600' }

export default function MisLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [estado, setEstado] = useState('')

  useEffect(() => { fetchLeads() }, [estado])

  async function fetchLeads() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (estado) params.set('estado', estado)
      const res = await fetch(`/api/vendedor/leads?${params}`)
      if (res.ok) { const d = await res.json(); setLeads(d.leads || []) }
    } catch { toast.error('Error al cargar leads') }
    finally { setLoading(false) }
  }

  async function cambiarEstado(id: string, nuevoEstado: string) {
    try {
      await fetch(`/api/vendedor/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nuevoEstado }) })
      toast.success('Estado actualizado')
      fetchLeads()
    } catch { toast.error('Error') }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Mis Leads</h1>
      <p className="text-sm text-muted-foreground mb-4">Leads asignados a vos</p>
      <div className="mb-4">
        <Select value={estado || 'all'} onValueChange={(v) => setEstado(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="NUEVO">Nuevos</SelectItem>
            <SelectItem value="EN_CONTACTO">En contacto</SelectItem>
            <SelectItem value="ATENDIDO">Atendidos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card><CardContent className="p-0">
        {loading ? <div className="py-12 text-center text-muted-foreground">Cargando...</div> :
         leads.length === 0 ? <div className="py-12 text-center text-muted-foreground"><ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />No hay leads</div> :
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30"><tr>
            <th className="p-3 text-left font-medium">Nombre</th>
            <th className="p-3 text-left font-medium hidden md:table-cell">Contacto</th>
            <th className="p-3 text-left font-medium">Origen</th>
            <th className="p-3 text-left font-medium">Estado</th>
            <th className="p-3 text-left font-medium">Cambiar</th>
          </tr></thead>
          <tbody>
            {leads.map(l => (
              <tr key={l.id} className="border-b border-border hover:bg-muted/20">
                <td className="p-3 font-medium">{l.name}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">
                  {l.primaryEmail && <div className="flex items-center gap-1 text-xs"><Mail className="h-3 w-3" />{l.primaryEmail}</div>}
                  {l.primaryPhone && <div className="flex items-center gap-1 text-xs"><Phone className="h-3 w-3" />{l.primaryPhone}</div>}
                </td>
                <td className="p-3"><Badge variant="secondary" className="text-xs">{l.sourceReferrer === 'landing-hominis' ? 'Hominis' : l.sourceReferrer === 'landing-seguros' ? 'Cotiza' : 'Directo'}</Badge></td>
                <td className="p-3"><Badge className={`text-xs ${STATUS_COLORS[l.status] || ''}`}>{STATUS_LABELS[l.status] || l.status}</Badge></td>
                <td className="p-3">
                  <Select onValueChange={(v) => cambiarEstado(l.id, v)}>
                    <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Cambiar..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NUEVO">Nuevo</SelectItem>
                      <SelectItem value="EN_CONTACTO">En contacto</SelectItem>
                      <SelectItem value="ATENDIDO">Atendido</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>}
      </CardContent></Card>
    </div>
  )
}
