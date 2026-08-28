'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Mail, Phone, Calendar, User, CheckCircle2, Clock,
  ListChecks, Users, Activity as ActivityIcon, LogIn, Bell, MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import LeafletMap from '@/components/LeafletMap'
import { toast } from 'sonner'

interface VendedorData {
  id: string
  email: string
  nombre: string
  apellido: string | null
  rol: string
  activo: boolean
  telefono: string | null
  avatarUrl: string | null  // foto (preservado)
  ultimoAcceso: string | null
  createdAt: string
  // NUEVO: campos logisticos
  documentNumber: string | null
  province: string | null
  city: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  coverageAreas: string | null
  horario: string | null
  hireDate: string | null
  _count: { contacts: number; tareasPendientes: number; totalTareas: number }
}

interface TareaData {
  id: string
  titulo: string
  descripcion: string | null
  tipo: string
  estado: string
  fechaLimite: string
  fechaCompletada: string | null
  contacto: { id: string; name: string; primaryEmail: string | null } | null
  admin: { id: string; nombre: string } | null
}

interface LeadData {
  id: string
  name: string
  primaryEmail: string | null
  primaryPhone: string | null
  status: string
  sourceReferrer: string | null
  createdAt: string
}

interface ActividadData {
  tipo: 'tarea' | 'contacto' | 'notificacion' | 'login'
  titulo: string
  fecha: string | null
  detalle: string | null
}

const STATUS_LABELS: Record<string, string> = {
  NUEVO: 'Nuevo', LEIDO: 'Leído', EN_CONTACTO: 'En proceso', REUNION: 'Reunión',
  PRESUPUESTO: 'Presupuesto', ATENDIDO: 'Atendido', RECHAZADO: 'Rechazado',
}
const STATUS_COLORS: Record<string, string> = {
  NUEVO: 'bg-violet-500/15 text-violet-600', LEIDO: 'bg-sky-500/15 text-sky-600',
  EN_CONTACTO: 'bg-amber-500/15 text-amber-600', ATENDIDO: 'bg-emerald-500/15 text-emerald-600',
  RECHAZADO: 'bg-red-500/15 text-red-600', REUNION: 'bg-indigo-500/15 text-indigo-600',
  PRESUPUESTO: 'bg-teal-500/15 text-teal-600',
}
const TAREA_ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-amber-500/15 text-amber-600',
  EN_PROGRESO: 'bg-sky-500/15 text-sky-600',
  COMPLETADA: 'bg-emerald-500/15 text-emerald-600',
  CANCELADA: 'bg-red-500/15 text-red-600',
}

const ACTIVIDAD_ICONS: Record<string, typeof LogIn> = {
  tarea: CheckCircle2,
  contacto: Users,
  notificacion: Bell,
  login: LogIn,
}
const ACTIVIDAD_COLORS: Record<string, string> = {
  tarea: 'text-emerald-600 bg-emerald-50',
  contacto: 'text-sky-600 bg-sky-50',
  notificacion: 'text-amber-600 bg-amber-50',
  login: 'text-violet-600 bg-violet-50',
}

export default function VendedorDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [vendedorId, setVendedorId] = useState<string | null>(null)
  const [vendedor, setVendedor] = useState<VendedorData | null>(null)
  const [tareas, setTareas] = useState<TareaData[]>([])
  const [leads, setLeads] = useState<LeadData[]>([])
  const [actividad, setActividad] = useState<ActividadData[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'datos' | 'tareas' | 'leads' | 'actividad'>('datos')

  useEffect(() => {
    params.then((p) => setVendedorId(p.id))
  }, [params])

  useEffect(() => {
    if (vendedorId) fetchData()
  }, [vendedorId])

  async function fetchData() {
    setLoading(true)
    try {
      const [userRes, tareasRes, leadsRes, actividadRes] = await Promise.all([
        fetch(`/api/admin/users/${vendedorId}`),
        fetch(`/api/admin/users/${vendedorId}/tareas`),
        fetch(`/api/admin/users/${vendedorId}/leads`),
        fetch(`/api/admin/users/${vendedorId}/actividad`),
      ])

      if (userRes.ok) setVendedor(await userRes.json())
      if (tareasRes.ok) setTareas(await tareasRes.json())
      if (leadsRes.ok) setLeads(await leadsRes.json())
      if (actividadRes.ok) {
        const actData = await actividadRes.json()
        setActividad(actData.actividades || [])
      }
    } catch (err) {
      console.error('Error:', err)
      toast.error('Error al cargar datos del vendedor')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!vendedor) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Vendedor no encontrado</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/vendedores')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver
        </Button>
      </div>
    )
  }

  const initials = `${vendedor.nombre[0] || ''}${(vendedor.apellido?.[0] || '')}`.toUpperCase()
  const fullName = `${vendedor.nombre} ${vendedor.apellido || ''}`

  return (
    <div>
      {/* Header con boton volver */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/vendedores')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver
        </Button>
        <h1 className="text-2xl font-bold flex-1">Detalle del vendedor</h1>
      </div>

      {/* Tarjeta principal con datos personales */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-24 w-24 border">
              <AvatarImage src={vendedor.avatarUrl || undefined} alt={fullName} />
              <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{fullName}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> {vendedor.email}
                </span>
                {vendedor.telefono && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {vendedor.telefono}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={vendedor.activo ? 'default' : 'secondary'}>
                  {vendedor.activo ? '🟢 Activo' : '🔴 Inactivo'}
                </Badge>
                <Badge variant="outline">{vendedor.rol}</Badge>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{vendedor._count?.contacts ?? 0}</p>
              <p className="text-xs text-muted-foreground">Leads asignados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{vendedor._count?.tareasPendientes ?? 0}</p>
              <p className="text-xs text-muted-foreground">Tareas pendientes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{vendedor._count?.totalTareas ?? 0}</p>
              <p className="text-xs text-muted-foreground">Tareas totales</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b">
        {[
          { id: 'datos', label: 'Datos personales', icon: User },
          { id: 'tareas', label: `Tareas (${tareas.length})`, icon: ListChecks },
          { id: 'leads', label: `Leads (${leads.length})`, icon: Users },
          { id: 'actividad', label: 'Actividad reciente', icon: ActivityIcon },
        ].map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab: Datos personales */}
      {tab === 'datos' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Nombre</Label>
                <p className="font-medium">{vendedor.nombre}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Apellido</Label>
                <p className="font-medium">{vendedor.apellido || '—'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="font-medium">{vendedor.email}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Teléfono</Label>
                <p className="font-medium">{vendedor.telefono || '—'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Estado</Label>
                <p>
                  <Badge variant={vendedor.activo ? 'default' : 'secondary'}>
                    {vendedor.activo ? '🟢 Activo' : '🔴 Inactivo'}
                  </Badge>
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Rol</Label>
                <p className="font-medium">{vendedor.rol}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Fecha de creación
                </Label>
                <p className="font-medium">
                  {vendedor.createdAt ? new Date(vendedor.createdAt).toLocaleDateString('es-AR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  }) : '—'}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <LogIn className="h-3 w-3" /> Último acceso
                </Label>
                <p className="font-medium">
                  {vendedor.ultimoAcceso
                    ? new Date(vendedor.ultimoAcceso).toLocaleString('es-AR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })
                    : 'Nunca'}
                </p>
              </div>
            </div>

            {/* === NUEVO: Sección Datos de logística === */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Datos de logística
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">DNI</Label>
                  <p className="font-medium">{vendedor.documentNumber || '—'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Fecha de ingreso
                  </Label>
                  <p className="font-medium">
                    {vendedor.hireDate
                      ? new Date(vendedor.hireDate).toLocaleDateString('es-AR', {
                          day: '2-digit', month: 'long', year: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Provincia
                  </Label>
                  <p className="font-medium">{vendedor.province || '—'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Ciudad</Label>
                  <p className="font-medium">{vendedor.city || '—'}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs text-muted-foreground">Dirección</Label>
                  <p className="font-medium">{vendedor.address || '—'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Horario de trabajo</Label>
                  <p className="font-medium">{vendedor.horario || '—'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Coordenadas</Label>
                  <p className="font-medium text-xs">
                    {vendedor.latitude !== null && vendedor.longitude !== null
                      ? `📍 ${vendedor.latitude.toFixed(4)}, ${vendedor.longitude.toFixed(4)}`
                      : '—'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs text-muted-foreground">Cobertura (provincias)</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {vendedor.coverageAreas
                      ? vendedor.coverageAreas.split(',').map((p, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{p.trim()}</Badge>
                        ))
                      : <span className="text-muted-foreground">Sin cobertura definida</span>}
                  </div>
                </div>

                {/* NUEVO: Mapa con la ubicacion del vendedor */}
                {vendedor.latitude !== null && vendedor.longitude !== null && (
                  <div className="md:col-span-2">
                    <Label className="text-xs text-muted-foreground mb-2 block">Ubicación en el mapa</Label>
                    <LeafletMap
                      lat={vendedor.latitude}
                      lng={vendedor.longitude}
                      label={fullName}
                      height="250px"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab: Tareas */}
      {tab === 'tareas' && (
        <Card>
          <CardContent className="p-0">
            {tareas.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <ListChecks className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No hay tareas asignadas
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="p-3 text-left font-medium">Título</th>
                      <th className="p-3 text-left font-medium hidden md:table-cell">Tipo</th>
                      <th className="p-3 text-left font-medium">Estado</th>
                      <th className="p-3 text-left font-medium hidden md:table-cell">Fecha límite</th>
                      <th className="p-3 text-left font-medium hidden lg:table-cell">Contacto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tareas.map((t) => (
                      <tr key={t.id} className="border-b hover:bg-muted/20">
                        <td className="p-3 font-medium">{t.titulo}</td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground">{t.tipo}</td>
                        <td className="p-3">
                          <Badge className={`text-xs ${TAREA_ESTADO_COLORS[t.estado] || 'bg-gray-500/15 text-gray-600'}`}>
                            {t.estado}
                          </Badge>
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">
                          {t.fechaLimite ? new Date(t.fechaLimite).toLocaleDateString('es-AR', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          }) : '—'}
                        </td>
                        <td className="p-3 hidden lg:table-cell text-muted-foreground">
                          {t.contacto ? t.contacto.name : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: Leads */}
      {tab === 'leads' && (
        <Card>
          <CardContent className="p-0">
            {leads.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No hay leads asignados
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/30">
                    <tr>
                      <th className="p-3 text-left font-medium">Nombre</th>
                      <th className="p-3 text-left font-medium hidden md:table-cell">Email</th>
                      <th className="p-3 text-left font-medium hidden lg:table-cell">Teléfono</th>
                      <th className="p-3 text-left font-medium">Estado</th>
                      <th className="p-3 text-left font-medium hidden md:table-cell">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => (
                      <tr key={l.id} className="border-b hover:bg-muted/20">
                        <td className="p-3 font-medium">{l.name}</td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground">{l.primaryEmail || '—'}</td>
                        <td className="p-3 hidden lg:table-cell text-muted-foreground">{l.primaryPhone || '—'}</td>
                        <td className="p-3">
                          <Badge className={`text-xs ${STATUS_COLORS[l.status] || 'bg-gray-500/15 text-gray-600'}`}>
                            {STATUS_LABELS[l.status] || l.status}
                          </Badge>
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted-foreground text-xs">
                          {l.createdAt ? new Date(l.createdAt).toLocaleDateString('es-AR', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab: Actividad reciente */}
      {tab === 'actividad' && (
        <Card>
          <CardContent className="p-6">
            {actividad.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <ActivityIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No hay actividad reciente
              </div>
            ) : (
              <div className="space-y-3">
                {actividad.map((a, idx) => {
                  const Icon = ACTIVIDAD_ICONS[a.tipo] || Bell
                  const colorClass = ACTIVIDAD_COLORS[a.tipo] || 'text-gray-600 bg-gray-50'
                  return (
                    <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{a.titulo}</p>
                        {a.detalle && <p className="text-xs text-muted-foreground mt-0.5">{a.detalle}</p>}
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {a.fecha ? new Date(a.fecha).toLocaleString('es-AR', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          }) : '—'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper component local
function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-xs uppercase tracking-wide ${className}`}>{children}</p>
}
