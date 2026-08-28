'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, CheckCircle2, Clock, ListChecks, Activity as ActivityIcon, Bell } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import LeafletMap from '@/components/LeafletMap'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, string> = {
  NUEVO: 'Nuevo', LEIDO: 'Leído', EN_CONTACTO: 'En contacto', REUNION: 'Reunión',
  PRESUPUESTO: 'Presupuesto', ATENDIDO: 'Atendido', RECHAZADO: 'Rechazado',
}
const STATUS_COLORS: Record<string, string> = {
  NUEVO: 'bg-violet-500/15 text-violet-600', LEIDO: 'bg-sky-500/15 text-sky-600',
  EN_CONTACTO: 'bg-amber-500/15 text-amber-600', ATENDIDO: 'bg-emerald-500/15 text-emerald-600',
  RECHAZADO: 'bg-red-500/15 text-red-600', REUNION: 'bg-indigo-500/15 text-indigo-600',
  PRESUPUESTO: 'bg-teal-500/15 text-teal-600',
}

const ACTIVIDAD_ICONS: Record<string, typeof CheckCircle2> = { tarea: CheckCircle2, notificacion: Bell, CREADO: User, LEIDO: CheckCircle2 }
const ACTIVIDAD_COLORS: Record<string, string> = { tarea: 'text-emerald-600 bg-emerald-50', notificacion: 'text-amber-600 bg-amber-50', CREADO: 'text-sky-600 bg-sky-50', LEIDO: 'text-sky-600 bg-sky-50' }

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs uppercase tracking-wide text-muted-foreground">{children}</p>
}

export default function ClienteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [clienteId, setClienteId] = useState<string | null>(null)
  const [cliente, setCliente] = useState<any>(null)
  const [tareas, setTareas] = useState<any[]>([])
  const [actividad, setActividad] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'datos' | 'tareas' | 'actividad'>('datos')

  useEffect(() => { params.then((p) => setClienteId(p.id)) }, [params])
  useEffect(() => {
    if (!clienteId) return
    Promise.all([
      fetch(`/api/admin/clientes/${clienteId}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/admin/clientes/${clienteId}/tareas`).then(r => r.ok ? r.json() : []),
      fetch(`/api/admin/clientes/${clienteId}/actividad`).then(r => r.ok ? r.json() : null),
    ]).then(([c, t, a]) => {
      setCliente(c); setTareas(t || []); setActividad(a?.actividades || [])
    }).catch(() => toast.error('Error al cargar')).finally(() => setLoading(false))
  }, [clienteId])

  if (loading) return <div className="py-12 text-center text-muted-foreground">Cargando...</div>
  if (!cliente) return (
    <div className="py-12 text-center">
      <p className="text-muted-foreground">Cliente no encontrado</p>
      <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/clientes')}><ArrowLeft className="h-4 w-4 mr-2" /> Volver</Button>
    </div>
  )

  const fullName = cliente.name
  const initials = fullName[0]?.toUpperCase() || '?'

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/clientes')}><ArrowLeft className="h-4 w-4 mr-1" /> Volver</Button>
        <h1 className="text-2xl font-bold flex-1">Detalle del cliente</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-24 w-24 border">
              <AvatarImage src={cliente.photoUrl || undefined} alt={fullName} />
              <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{fullName}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                {cliente.primaryEmail && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {cliente.primaryEmail}</span>}
                {cliente.primaryPhone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {cliente.primaryPhone}</span>}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`text-xs ${STATUS_COLORS[cliente.status] || 'bg-gray-500/15 text-gray-600'}`}>{STATUS_LABELS[cliente.status] || cliente.status}</Badge>
                {cliente.province && <Badge variant="outline" className="text-xs"><MapPin className="h-2.5 w-2.5 mr-0.5" />{cliente.province}</Badge>}
              </div>
              {cliente.owner && <p className="text-xs text-muted-foreground mt-2">👤 Vendedor: {cliente.owner.nombre} {cliente.owner.apellido}</p>}
              {cliente.empresa && <p className="text-xs text-muted-foreground">🏢 Empresa: {cliente.empresa.nombre}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-1 mb-4 border-b">
        {[{ id: 'datos', label: 'Datos', icon: User }, { id: 'tareas', label: `Tareas (${tareas.length})`, icon: ListChecks }, { id: 'actividad', label: 'Actividad', icon: ActivityIcon }].map((t) => {
          const Icon = t.icon
          return <button key={t.id} onClick={() => setTab(t.id as any)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}><Icon className="h-4 w-4" /> {t.label}</button>
        })}
      </div>

      {tab === 'datos' && (
        <Card><CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><FieldLabel>Nombre</FieldLabel><p className="font-medium">{cliente.name}</p></div>
            <div><FieldLabel>Email</FieldLabel><p className="font-medium">{cliente.primaryEmail || '—'}</p></div>
            <div><FieldLabel>Teléfono</FieldLabel><p className="font-medium">{cliente.primaryPhone || '—'}</p></div>
            <div><FieldLabel>DNI</FieldLabel><p className="font-medium">{cliente.dni || '—'}</p></div>
            <div><FieldLabel>Provincia</FieldLabel><p className="font-medium">{cliente.province || '—'}</p></div>
            <div><FieldLabel>Ciudad</FieldLabel><p className="font-medium">{cliente.city || '—'}</p></div>
            <div className="md:col-span-2"><FieldLabel>Dirección</FieldLabel><p className="font-medium">{cliente.address || '—'}</p></div>
            <div><FieldLabel>Estado</FieldLabel><Badge className={`text-xs ${STATUS_COLORS[cliente.status] || ''}`}>{STATUS_LABELS[cliente.status] || cliente.status}</Badge></div>
            <div><FieldLabel>Fecha de creación</FieldLabel><p className="font-medium">{cliente.createdAt ? new Date(cliente.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}</p></div>
            {cliente.notas && <div className="md:col-span-2"><FieldLabel>Notas</FieldLabel><p className="font-medium text-sm bg-muted/30 p-3 rounded-lg">{cliente.notas}</p></div>}
          </div>
          {cliente.latitude !== null && cliente.longitude !== null && (
            <div className="border-t pt-4">
              <FieldLabel>Ubicación en el mapa</FieldLabel>
              <div className="mt-2"><LeafletMap lat={cliente.latitude} lng={cliente.longitude} label={fullName} height="250px" /></div>
            </div>
          )}
        </CardContent></Card>
      )}

      {tab === 'tareas' && (
        <Card><CardContent className="p-0">
          {tareas.length === 0 ? <div className="py-12 text-center text-muted-foreground"><ListChecks className="h-8 w-8 mx-auto mb-2 opacity-50" />No hay tareas asignadas</div> : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead className="border-b bg-muted/30"><tr><th className="p-3 text-left font-medium">Título</th><th className="p-3 text-left font-medium hidden md:table-cell">Tipo</th><th className="p-3 text-left font-medium">Estado</th><th className="p-3 text-left font-medium hidden md:table-cell">Fecha límite</th></tr></thead>
              <tbody>{tareas.map((t) => <tr key={t.id} className="border-b hover:bg-muted/20"><td className="p-3 font-medium">{t.titulo}</td><td className="p-3 hidden md:table-cell text-muted-foreground">{t.tipo}</td><td className="p-3"><Badge variant="outline" className="text-xs">{t.estado}</Badge></td><td className="p-3 hidden md:table-cell text-muted-foreground text-xs">{t.fechaLimite ? new Date(t.fechaLimite).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td></tr>)}</tbody>
            </table></div>
          )}
        </CardContent></Card>
      )}

      {tab === 'actividad' && (
        <Card><CardContent className="p-6">
          {actividad.length === 0 ? <div className="py-12 text-center text-muted-foreground"><ActivityIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />No hay actividad reciente</div> : (
            <div className="space-y-3">{actividad.map((a, idx) => {
              const Icon = ACTIVIDAD_ICONS[a.tipo] || Bell
              const colorClass = ACTIVIDAD_COLORS[a.tipo] || 'text-gray-600 bg-gray-50'
              return <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${colorClass}`}><Icon className="h-4 w-4" /></div>
                <div className="flex-1"><p className="text-sm font-medium">{a.titulo}</p>{a.detalle && <p className="text-xs text-muted-foreground mt-0.5">{a.detalle}</p>}<p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />{a.fecha ? new Date(a.fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</p></div>
              </div>
            })}</div>
          )}
        </CardContent></Card>
      )}
    </div>
  )
}
