'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, Search, UserCheck, UserX, Pencil, Trash2, Eye, Camera, MapPin, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { PROVINCIAS_ARGENTINA } from '@/lib/provincias'
import LeafletMap from '@/components/LeafletMap'

interface Vendedor {
  id: string
  email: string
  nombre: string
  apellido: string | null
  rol: string
  activo: boolean
  telefono: string | null
  avatarUrl: string | null  // foto (preservado)
  // FIX: campos logisticos (faltaban en la interface — causaba que openEditDialog no cargara lat/lng)
  documentNumber: string | null
  province: string | null
  city: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  coverageAreas: string | null
  horario: string | null
  hireDate: string | null
  _count: { contacts: number; tareasPendientes: number }
}

// Helper para parsear coverageAreas (string separado por coma → array)
function parseCobertura(cov: string | null | undefined): string[] {
  if (!cov) return []
  return cov.split(',').map((p) => p.trim()).filter(Boolean)
}

export default function VendedoresPage() {
  const router = useRouter()
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', telefono: '', password: '' })
  // Foto (preservado)
  const [formAvatar, setFormAvatar] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const createFileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // NUEVO: estado logistico para crear
  const [formLogistica, setFormLogistica] = useState({
    dni: '', provincia: '', ciudad: '', direccion: '',
    latitud: '' as string | number, longitud: '' as string | number,
    horario: '', fechaIngreso: '',
  })
  const [formCobertura, setFormCobertura] = useState<string[]>([])
  const [geocoding, setGeocoding] = useState(false)

  // Editar (preservado)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({ id: '', nombre: '', apellido: '', email: '', telefono: '', activo: true })
  const [editAvatar, setEditAvatar] = useState<string | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  // NUEVO: estado logistico para editar
  const [editLogistica, setEditLogistica] = useState({
    dni: '', provincia: '', ciudad: '', direccion: '',
    latitud: '' as string | number, longitud: '' as string | number,
    horario: '', fechaIngreso: '',
  })
  const [editCobertura, setEditCobertura] = useState<string[]>([])

  // Eliminar (preservado)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchVendedores() }, [])

  async function fetchVendedores() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users?role=VENDEDOR')
      if (res.ok) setVendedores(await res.json())
    } catch { toast.error('Error al cargar vendedores') }
    finally { setLoading(false) }
  }

  // === Foto (preservado) ===
  async function handleFileSelect(file: File, target: 'create' | 'edit') {
    if (!file) return
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)$/)) {
      toast.error('Formato no soportado. Usá JPG, PNG, WEBP o GIF.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagen demasiado grande. Máximo 2MB.')
      return
    }
    setUploadingAvatar(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string
        try {
          const res = await fetch('/api/admin/upload', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataUrl }),
          })
          if (res.ok) {
            const data = await res.json()
            if (target === 'create') setFormAvatar(data.url)
            else setEditAvatar(data.url)
            toast.success('Foto cargada')
          } else {
            const err = await res.json()
            toast.error(err.error || 'Error al subir foto')
          }
        } catch { toast.error('Error al subir foto') }
        finally { setUploadingAvatar(false) }
      }
      reader.readAsDataURL(file)
    } catch { toast.error('Error al leer archivo'); setUploadingAvatar(false) }
  }

  // === NUEVO: Geocodificación automática ===
  // NUEVO: refs para trackear el valor anterior de la direccion (evita re-geocodificar al abrir el modal)
  const lastGeocodedDireccion = useRef<string>('')

  async function geocodificar(provincia: string, ciudad: string, direccion: string, target: 'create' | 'edit') {
    if (!provincia && !ciudad && !direccion) return
    // FIX: no re-geocodificar si la direccion no cambio (evita el warning al abrir el modal de edicion)
    const fullAddress = `${provincia}|${ciudad}|${direccion}`
    if (fullAddress === lastGeocodedDireccion.current) return
    lastGeocodedDireccion.current = fullAddress

    setGeocoding(true)
    try {
      const res = await fetch('/api/admin/geocode', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provincia, ciudad, direccion }),
      })
      const data = await res.json()
      if (data.lat && data.lng) {
        if (target === 'create') {
          setFormLogistica(prev => ({ ...prev, latitud: data.lat, longitud: data.lng }))
        } else {
          setEditLogistica(prev => ({ ...prev, latitud: data.lat, longitud: data.lng }))
        }
        toast.success(`Ubicación actualizada: ${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`)
      } else {
        // FIX: si ya hay coordenadas guardadas, no mostrar el warning molesto
        const currentLat = target === 'create' ? formLogistica.latitud : editLogistica.latitud
        if (currentLat !== '') {
          toast.info('No se actualizó la ubicación. Se mantiene la coordenada guardada anterior.')
        } else {
          toast.warning('No se encontró la dirección. Podés seleccionar la ubicación manualmente en el mapa.')
        }
      }
    } catch {
      toast.error('Error al geocodificar')
    } finally { setGeocoding(false) }
  }

  // === CREAR VENDEDOR (preservado + logisticos) ===
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, rol: 'VENDEDOR', avatarUrl: formAvatar,  // foto (preservado)
          // NUEVO: campos logisticos
          documentNumber: formLogistica.dni || undefined,
          province: formLogistica.provincia || undefined,
          city: formLogistica.ciudad || undefined,
          address: formLogistica.direccion || undefined,
          latitude: formLogistica.latitud !== '' ? formLogistica.latitud : undefined,
          longitude: formLogistica.longitud !== '' ? formLogistica.longitud : undefined,
          horario: formLogistica.horario || undefined,
          hireDate: formLogistica.fechaIngreso || undefined,
          coverageAreas: formCobertura,  // array de provincias
        }),
      })
      if (res.ok) {
        toast.success('Vendedor creado')
        setDialogOpen(false)
        setForm({ nombre: '', apellido: '', email: '', telefono: '', password: '' })
        setFormAvatar(null)
        setFormLogistica({ dni: '', provincia: '', ciudad: '', direccion: '', latitud: '', longitud: '', horario: '', fechaIngreso: '' })
        setFormCobertura([])
        fetchVendedores()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al crear')
      }
    } catch { toast.error('Error de conexión') }
  }

  // === ACTIVAR/DESACTIVAR (preservado) ===
  async function toggleActivo(v: Vendedor) {
    try {
      await fetch(`/api/admin/users/${v.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !v.activo }),
      })
      toast.success(v.activo ? 'Desactivado' : 'Activado')
      fetchVendedores()
    } catch { toast.error('Error') }
  }

  // === EDITAR (preservado + logisticos) ===
  function openEditDialog(v: Vendedor) {
    setEditForm({
      id: v.id, nombre: v.nombre, apellido: v.apellido || '',
      email: v.email, telefono: v.telefono || '', activo: v.activo,
    })
    setEditAvatar(v.avatarUrl || null)
    setEditLogistica({
      dni: v.documentNumber || '',
      provincia: v.province || '',
      ciudad: v.city || '',
      direccion: v.address || '',
      // FIX: ahora latitude/longitude estan en la interface Vendedor
      latitud: v.latitude ?? '',
      longitud: v.longitude ?? '',
      horario: v.horario || '',
      fechaIngreso: v.hireDate ? new Date(v.hireDate).toISOString().slice(0, 10) : '',
    })
    setEditCobertura(parseCobertura(v.coverageAreas))
    // FIX: inicializar el ref con la direccion actual para evitar que el onBlur re-geocodifique al abrir
    lastGeocodedDireccion.current = `${v.province || ''}|${v.city || ''}|${v.address || ''}`
    setEditDialogOpen(true)
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/admin/users/${editForm.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: editForm.nombre, apellido: editForm.apellido || null,
          email: editForm.email, telefono: editForm.telefono || null, activo: editForm.activo,
          avatarUrl: editAvatar,
          // NUEVO: campos logisticos
          documentNumber: editLogistica.dni || null,
          province: editLogistica.provincia || null,
          city: editLogistica.ciudad || null,
          address: editLogistica.direccion || null,
          latitude: editLogistica.latitud !== '' ? Number(editLogistica.latitud) : null,
          longitude: editLogistica.longitud !== '' ? Number(editLogistica.longitud) : null,
          horario: editLogistica.horario || null,
          hireDate: editLogistica.fechaIngreso || null,
          coverageAreas: editCobertura,
        }),
      })
      if (res.ok) {
        toast.success('Vendedor actualizado')
        setEditDialogOpen(false)
        fetchVendedores()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al actualizar')
      }
    } catch { toast.error('Error de conexión') }
    finally { setSavingEdit(false) }
  }

  // === ELIMINAR (preservado) ===
  function openDeleteDialog(v: Vendedor) {
    setDeleteTarget(v.id)
    setDeleteName(`${v.nombre} ${v.apellido || ''}`)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Vendedor eliminado')
        setDeleteTarget(null)
        fetchVendedores()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Error al eliminar')
      }
    } catch { toast.error('Error de conexión') }
    finally { setDeleting(false) }
  }

  function verDetalle(id: string) {
    router.push(`/admin/vendedores/${id}`)
  }

  // Toggle cobertura (multi-select)
  function toggleCobertura(provincia: string, target: 'create' | 'edit') {
    const setter = target === 'create' ? setFormCobertura : setEditCobertura
    const current = target === 'create' ? formCobertura : editCobertura
    setter(current.includes(provincia) ? current.filter((p) => p !== provincia) : [...current, provincia])
  }

  const filtered = search
    ? vendedores.filter(v => `${v.nombre} ${v.apellido || ''}`.toLowerCase().includes(search.toLowerCase()) || v.email.toLowerCase().includes(search.toLowerCase()))
    : vendedores

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Vendedores</h1>
          <p className="text-sm text-muted-foreground">Gestión del equipo de ventas</p>
        </div>
        <Button onClick={() => {
          // FIX: resetear el ref de geocodificacion al abrir el modal de crear
          lastGeocodedDireccion.current = ''
          setDialogOpen(true)
        }} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nuevo vendedor
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar vendedor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-muted-foreground col-span-full text-center py-8">Cargando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" /> No hay vendedores
          </p>
        ) : filtered.map((v) => {
          const initials = `${v.nombre[0] || ''}${(v.apellido?.[0] || '')}`.toUpperCase()
          return (
            <Card key={v.id}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={v.avatarUrl || undefined} alt={v.nombre} />
                    <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{v.nombre} {v.apellido}</p>
                    <p className="text-sm text-muted-foreground truncate">{v.email}</p>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      <Badge variant={v.activo ? 'default' : 'secondary'} className="text-xs">
                        {v.activo ? '🟢 Activo' : '🔴 Inactivo'}
                      </Badge>
                      {/* NUEVO: mostrar provincia y cobertura */}
                      {v.province && (
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-2.5 w-2.5 mr-0.5" /> {v.province}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {/* NUEVO: mostrar cobertura si existe */}
                {v.coverageAreas && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium">Cobertura:</span> {v.coverageAreas}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 mt-4 text-center border-t border-border pt-4">
                  <div>
                    <p className="text-xl font-bold">{v._count?.contacts ?? 0}</p>
                    <p className="text-[11px] text-muted-foreground">Leads</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-amber-600">{v._count?.tareasPendientes ?? 0}</p>
                    <p className="text-[11px] text-muted-foreground">Tareas</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 mt-3">
                  <Button variant="outline" size="sm" onClick={() => verDetalle(v.id)} title="Ver detalle">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(v)} title="Editar">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openDeleteDialog(v)} title="Eliminar" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => toggleActivo(v)}>
                  {v.activo ? <><UserX className="h-4 w-4 mr-1" /> Desactivar</> : <><UserCheck className="h-4 w-4 mr-1" /> Activar</>}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* === MODAL CREAR VENDEDOR (preservado + logisticos) === */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nuevo vendedor</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Foto (preservado) */}
            <div className="space-y-2">
              <Label>Foto de perfil (opcional)</Label>
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage src={formAvatar || undefined} alt="Preview" />
                  <AvatarFallback className="bg-muted"><Camera className="h-6 w-6 text-muted-foreground" /></AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <input ref={createFileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'create')} className="hidden" />
                  <Button type="button" variant="outline" size="sm" onClick={() => createFileInputRef.current?.click()} disabled={uploadingAvatar}>
                    <Camera className="h-4 w-4 mr-2" />{uploadingAvatar ? 'Subiendo...' : (formAvatar ? 'Cambiar foto' : 'Subir foto')}
                  </Button>
                  {formAvatar && <Button type="button" variant="ghost" size="sm" onClick={() => setFormAvatar(null)} className="ml-2 text-red-600">Quitar</Button>}
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP. Máx 500KB.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nombre</Label><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Apellido</Label><Input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Teléfono</Label><Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
            <div className="space-y-2"><Label>Contraseña</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required placeholder="Mínimo 6 caracteres" minLength={6} /></div>

            {/* === NUEVO: Datos logisticos === */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Datos de logística</h3>
              <div className="space-y-3">
                {/* Campos logisticos inlineados (no como componente separado para evitar perdida de foco) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>DNI</Label>
                    <Input
                      value={formLogistica.dni}
                      onChange={(e) => setFormLogistica({ ...formLogistica, dni: e.target.value })}
                      placeholder="12345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de ingreso</Label>
                    <Input
                      type="date"
                      value={formLogistica.fechaIngreso}
                      onChange={(e) => setFormLogistica({ ...formLogistica, fechaIngreso: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Provincia</Label>
                  <Select
                    value={formLogistica.provincia || '_none'}
                    onValueChange={(v) => {
                      const prov = v === '_none' ? '' : v
                      setFormLogistica({ ...formLogistica, provincia: prov })
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccionar provincia" /></SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      <SelectItem value="_none">— Sin provincia —</SelectItem>
                      {PROVINCIAS_ARGENTINA.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Ciudad</Label>
                    <Input
                      value={formLogistica.ciudad}
                      onChange={(e) => setFormLogistica({ ...formLogistica, ciudad: e.target.value })}
                      placeholder="Posadas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Horario de trabajo</Label>
                    <Input
                      value={formLogistica.horario}
                      onChange={(e) => setFormLogistica({ ...formLogistica, horario: e.target.value })}
                      placeholder="Lun-Vie 9-18"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formLogistica.direccion}
                      onChange={(e) => setFormLogistica({ ...formLogistica, direccion: e.target.value })}
                      placeholder="Av. Santa Fe 1234"
                      onBlur={() => geocodificar(formLogistica.provincia, formLogistica.ciudad, formLogistica.direccion, 'create')}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => geocodificar(formLogistica.provincia, formLogistica.ciudad, formLogistica.direccion, 'create')}
                      disabled={geocoding}
                    >
                      {geocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                    </Button>
                  </div>
                  {formLogistica.latitud !== '' && formLogistica.longitud !== '' && (
                    <p className="text-xs text-muted-foreground">
                      📍 Coordenadas: {formLogistica.latitud}, {formLogistica.longitud}
                    </p>
                  )}
                </div>

                {/* Mapa interactivo con la ubicacion geocodificada (arrastrable + clic) */}
                {formLogistica.latitud !== '' && formLogistica.longitud !== '' && (
                  <LeafletMap
                    lat={Number(formLogistica.latitud)}
                    lng={Number(formLogistica.longitud)}
                    label="Nuevo vendedor"
                    height="200px"
                    draggable={true}
                    onDragEnd={(lat, lng) => {
                      setFormLogistica(prev => ({ ...prev, latitud: lat, longitud: lng }))
                      toast.info(`Ubicación ajustada: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
                    }}
                    onClick={(lat, lng) => {
                      setFormLogistica(prev => ({ ...prev, latitud: lat, longitud: lng }))
                      toast.info(`Ubicación seleccionada: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
                    }}
                  />
                )}

                <div className="space-y-2">
                  <Label>Cobertura (provincias que cubre)</Label>
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2 grid grid-cols-2 gap-1">
                    {PROVINCIAS_ARGENTINA.map((p) => (
                      <label key={p} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
                        <Checkbox
                          checked={formCobertura.includes(p)}
                          onCheckedChange={() => toggleCobertura(p, 'create')}
                        />
                        <span className="truncate">{p}</span>
                      </label>
                    ))}
                  </div>
                  {formCobertura.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formCobertura.length} provincia(s) seleccionada(s): {formCobertura.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Crear vendedor</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* === MODAL EDITAR VENDEDOR (preservado + logisticos) === */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar vendedor</DialogTitle></DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {/* Foto (preservado) */}
            <div className="space-y-2">
              <Label>Foto de perfil</Label>
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage src={editAvatar || undefined} alt="Preview" />
                  <AvatarFallback className="bg-muted"><Camera className="h-6 w-6 text-muted-foreground" /></AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <input ref={editFileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], 'edit')} className="hidden" />
                  <Button type="button" variant="outline" size="sm" onClick={() => editFileInputRef.current?.click()} disabled={uploadingAvatar}>
                    <Camera className="h-4 w-4 mr-2" />{uploadingAvatar ? 'Subiendo...' : (editAvatar ? 'Cambiar foto' : 'Subir foto')}
                  </Button>
                  {editAvatar && <Button type="button" variant="ghost" size="sm" onClick={() => setEditAvatar(null)} className="ml-2 text-red-600">Quitar</Button>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Nombre</Label><Input value={editForm.nombre} onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Apellido</Label><Input value={editForm.apellido} onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Teléfono</Label><Input value={editForm.telefono} onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <div className="flex gap-2">
                <Button type="button" variant={editForm.activo ? 'default' : 'outline'} size="sm" onClick={() => setEditForm({ ...editForm, activo: true })}>🟢 Activo</Button>
                <Button type="button" variant={!editForm.activo ? 'default' : 'outline'} size="sm" onClick={() => setEditForm({ ...editForm, activo: false })}>🔴 Inactivo</Button>
              </div>
            </div>

            {/* === NUEVO: Datos logisticos === */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Datos de logística</h3>
              <div className="space-y-3">
                {/* Campos logisticos inlineados (no como componente separado para evitar perdida de foco) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>DNI</Label>
                    <Input
                      value={editLogistica.dni}
                      onChange={(e) => setEditLogistica({ ...editLogistica, dni: e.target.value })}
                      placeholder="12345678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de ingreso</Label>
                    <Input
                      type="date"
                      value={editLogistica.fechaIngreso}
                      onChange={(e) => setEditLogistica({ ...editLogistica, fechaIngreso: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Provincia</Label>
                  <Select
                    value={editLogistica.provincia || '_none'}
                    onValueChange={(v) => {
                      const prov = v === '_none' ? '' : v
                      setEditLogistica({ ...editLogistica, provincia: prov })
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccionar provincia" /></SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      <SelectItem value="_none">— Sin provincia —</SelectItem>
                      {PROVINCIAS_ARGENTINA.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Ciudad</Label>
                    <Input
                      value={editLogistica.ciudad}
                      onChange={(e) => setEditLogistica({ ...editLogistica, ciudad: e.target.value })}
                      placeholder="Posadas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Horario de trabajo</Label>
                    <Input
                      value={editLogistica.horario}
                      onChange={(e) => setEditLogistica({ ...editLogistica, horario: e.target.value })}
                      placeholder="Lun-Vie 9-18"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <div className="flex gap-2">
                    <Input
                      value={editLogistica.direccion}
                      onChange={(e) => setEditLogistica({ ...editLogistica, direccion: e.target.value })}
                      placeholder="Av. Santa Fe 1234"
                      onBlur={() => geocodificar(editLogistica.provincia, editLogistica.ciudad, editLogistica.direccion, 'edit')}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => geocodificar(editLogistica.provincia, editLogistica.ciudad, editLogistica.direccion, 'edit')}
                      disabled={geocoding}
                    >
                      {geocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                    </Button>
                  </div>
                  {editLogistica.latitud !== '' && editLogistica.longitud !== '' && (
                    <p className="text-xs text-muted-foreground">
                      📍 Coordenadas: {editLogistica.latitud}, {editLogistica.longitud}
                    </p>
                  )}
                </div>

                {/* Mapa interactivo con la ubicacion geocodificada (arrastrable + clic) */}
                {editLogistica.latitud !== '' && editLogistica.longitud !== '' && (
                  <LeafletMap
                    lat={Number(editLogistica.latitud)}
                    lng={Number(editLogistica.longitud)}
                    label={editForm.nombre || 'Vendedor'}
                    height="200px"
                    draggable={true}
                    onDragEnd={(lat, lng) => {
                      setEditLogistica(prev => ({ ...prev, latitud: lat, longitud: lng }))
                      toast.info(`Ubicación ajustada: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
                    }}
                    onClick={(lat, lng) => {
                      setEditLogistica(prev => ({ ...prev, latitud: lat, longitud: lng }))
                      toast.info(`Ubicación seleccionada: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
                    }}
                  />
                )}

                <div className="space-y-2">
                  <Label>Cobertura (provincias que cubre)</Label>
                  <div className="max-h-32 overflow-y-auto border rounded-md p-2 grid grid-cols-2 gap-1">
                    {PROVINCIAS_ARGENTINA.map((p) => (
                      <label key={p} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5">
                        <Checkbox
                          checked={editCobertura.includes(p)}
                          onCheckedChange={() => toggleCobertura(p, 'edit')}
                        />
                        <span className="truncate">{p}</span>
                      </label>
                    ))}
                  </div>
                  {editCobertura.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {editCobertura.length} provincia(s) seleccionada(s): {editCobertura.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={savingEdit}>{savingEdit ? 'Guardando...' : 'Guardar cambios'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* === DIALOG CONFIRMACION ELIMINAR (preservado) === */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar vendedor</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a <strong>{deleteName}</strong>?
              <br /><br />
              Esta acción no se puede deshacer. Si el vendedor tiene leads o tareas asignadas,
              primero deberás reasignarlos o desactivarlo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="h-4 w-4 mr-2" /> {deleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
