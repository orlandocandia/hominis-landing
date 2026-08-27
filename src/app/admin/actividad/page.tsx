'use client'

import { useState, useEffect } from 'react'
import { Activity, Search, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Actividad {
  id: string
  action: string
  note: string | null
  createdAt: string
  user: { id: string; nombre: string; apellido: string | null; email: string } | null
}

const ACTION_LABELS: Record<string,string> = {
  CREADO: 'Lead creado',
  LEIDO: 'Lead leído',
  EN_CONTACTO: 'En contacto',
  REUNION: 'Reunión',
  PRESUPUESTO: 'Presupuesto',
  ATENDIDO: 'Atendido',
  RECHAZADO: 'Rechazado',
  NOTA: 'Nota',
  LLAMADA: 'Llamada',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
  VISITA: 'Visita',
}

const ACTION_COLORS: Record<string,string> = {
  CREADO: 'bg-violet-500/15 text-violet-600',
  ATENDIDO: 'bg-emerald-500/15 text-emerald-600',
  RECHAZADO: 'bg-red-500/15 text-red-600',
  LLAMADA: 'bg-sky-500/15 text-sky-600',
  WHATSAPP: 'bg-green-500/15 text-green-600',
  EMAIL: 'bg-blue-500/15 text-blue-600',
}

export default function ActividadPage() {
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchActividades() }, [page, action])

  async function fetchActividades() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (action) params.set('action', action)
      const res = await fetch(`/api/admin/actividad?${params}`)
      if (res.ok) {
        const data = await res.json()
        setActividades(data.actividades || [])
        setTotal(data.total || 0)
      }
    } catch {
      // ignore
    } finally { setLoading(false) }
  }

  const filtered = search
    ? actividades.filter(a => a.user?.nombre?.toLowerCase().includes(search.toLowerCase()) || a.action.toLowerCase().includes(search.toLowerCase()))
    : actividades

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Bitácora de Actividad</h1>
      <p className="text-sm text-muted-foreground mb-4">Registro de acciones del equipo ({total} total)</p>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por vendedor o acción..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={action || 'all'} onValueChange={(v) => { setAction(v === 'all' ? '' : v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="Acción" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="CREADO">Lead creado</SelectItem>
            <SelectItem value="ATENDIDO">Atendido</SelectItem>
            <SelectItem value="LLAMADA">Llamada</SelectItem>
            <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
            <SelectItem value="EMAIL">Email</SelectItem>
            <SelectItem value="VISITA">Visita</SelectItem>
            <SelectItem value="RECHAZADO">Rechazado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card><CardContent className="p-0">
        {loading ? <div className="py-12 text-center text-muted-foreground">Cargando...</div> :
         filtered.length === 0 ? <div className="py-12 text-center text-muted-foreground"><Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />No hay actividad</div> :
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30"><tr>
            <th className="p-3 text-left font-medium">Vendedor</th>
            <th className="p-3 text-left font-medium">Acción</th>
            <th className="p-3 text-left font-medium hidden md:table-cell">Detalle</th>
            <th className="p-3 text-left font-medium">Fecha</th>
          </tr></thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} className="border-b border-border hover:bg-muted/20">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7"><AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">{(a.user?.nombre?.[0] || '?').toUpperCase()}</AvatarFallback></Avatar>
                    <span className="font-medium">{a.user?.nombre || '—'} {a.user?.apellido || ''}</span>
                  </div>
                </td>
                <td className="p-3"><Badge className={`text-xs ${ACTION_COLORS[a.action] || 'bg-gray-500/15 text-gray-600'}`}>{ACTION_LABELS[a.action] || a.action}</Badge></td>
                <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">{a.note || '—'}</td>
                <td className="p-3 text-muted-foreground text-xs">{new Date(a.createdAt).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
            ))}
          </tbody>
        </table></div>}
      </CardContent></Card>

      {total > 20 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">Página {page} de {Math.ceil(total / 20)}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-muted">Anterior</button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-muted">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  )
}
