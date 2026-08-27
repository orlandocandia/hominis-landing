'use client'

import { useState, useEffect } from 'react'
import { ListTodo, CheckCircle2, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface Tarea { id: string; titulo: string; descripcion: string | null; estado: string; fechaLimite: string }

const ESTADO_LABELS: Record<string,string> = { PENDIENTE: 'Pendiente', EN_PROGRESO: 'En progreso', COMPLETADA: 'Completada', CANCELADA: 'Cancelada' }
const ESTADO_COLORS: Record<string,string> = { PENDIENTE: 'bg-amber-500/15 text-amber-600', EN_PROGRESO: 'bg-sky-500/15 text-sky-600', COMPLETADA: 'bg-emerald-500/15 text-emerald-600', CANCELADA: 'bg-red-500/15 text-red-600' }

export default function MisTareasPage() {
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [loading, setLoading] = useState(true)
  const [estado, setEstado] = useState('')

  useEffect(() => { fetchTareas() }, [estado])

  async function fetchTareas() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (estado) params.set('estado', estado)
      const res = await fetch(`/api/vendedor/tareas?${params}`)
      if (res.ok) { const d = await res.json(); setTareas(d.tareas || []) }
    } catch { toast.error('Error al cargar tareas') }
    finally { setLoading(false) }
  }

  async function completar(id: string) {
    try {
      await fetch(`/api/vendedor/tareas/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado: 'COMPLETADA' }) })
      toast.success('Tarea completada')
      fetchTareas()
    } catch { toast.error('Error') }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Mis Tareas</h1>
      <p className="text-sm text-muted-foreground mb-4">Tareas asignadas a vos</p>
      <div className="mb-4">
        <Select value={estado || 'all'} onValueChange={(v) => setEstado(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="PENDIENTE">Pendientes</SelectItem>
            <SelectItem value="COMPLETADA">Completadas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card><CardContent className="p-0">
        {loading ? <div className="py-12 text-center text-muted-foreground">Cargando...</div> :
         tareas.length === 0 ? <div className="py-12 text-center text-muted-foreground"><ListTodo className="h-8 w-8 mx-auto mb-2 opacity-50" />No hay tareas</div> :
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30"><tr>
            <th className="p-3 text-left font-medium">Título</th>
            <th className="p-3 text-left font-medium hidden md:table-cell">Vence</th>
            <th className="p-3 text-left font-medium">Estado</th>
            <th className="p-3 text-right font-medium">Acción</th>
          </tr></thead>
          <tbody>
            {tareas.map(t => (
              <tr key={t.id} className="border-b border-border hover:bg-muted/20">
                <td className="p-3 font-medium">{t.titulo}</td>
                <td className="p-3 hidden md:table-cell text-muted-foreground text-xs"><Calendar className="inline h-3 w-3 mr-1" />{new Date(t.fechaLimite).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</td>
                <td className="p-3"><Badge className={`text-xs ${ESTADO_COLORS[t.estado] || ''}`}>{ESTADO_LABELS[t.estado] || t.estado}</Badge></td>
                <td className="p-3 text-right">{t.estado !== 'COMPLETADA' && <Button variant="ghost" size="sm" onClick={() => completar(t.id)}><CheckCircle2 className="h-4 w-4 text-emerald-500" /></Button>}</td>
              </tr>
            ))}
          </tbody>
        </table></div>}
      </CardContent></Card>
    </div>
  )
}
