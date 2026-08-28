'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Pencil, Trash2, Eye, Camera, MapPin, Loader2, Users, Phone, Mail, Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { PROVINCIAS_ARGENTINA } from '@/lib/provincias'
import LeafletMap from '@/components/LeafletMap'

interface Cliente {
  id: string
  name: string
  primaryEmail: string | null
  primaryPhone: string | null
  status: string
  province: string | null
  city: string | null
  ownerId: string | null
  empresaId: string | null
  photoUrl: string | null
  dni: string | null
  createdAt: string
}

interface Vendedor {
  id: string
  nombre: string
  apellido: string | null
  province: string | null
  coverageAreas: string | null
  activo: boolean
}

interface Empresa {
  id: string
  nombre: string
}

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

export default function ClientesPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', telefono: '', dni: '', provincia: '', ciudad: '', direccion: '', notas: '', empresaId: '', ownerId: '', status: 'NUEVO' })
  const [formPhoto, setFormPhoto] = useState<string | null>(null)
  const [formCoords, setFormCoords] = useState<{ lat: string | number; lng: string | number }>({ lat: '', lng: '' })
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [lastGeocoded, setLastGeocoded] = useState('')
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editId, setEditId] = useState('')
  const [editForm, setEditForm] = useState(form)
  const [editPhoto, setEditPhoto] = useState<string | null>(null)
  const [editCoords, setEditCoords] = useState<{ lat: string | number; lng: string | number }>({ lat: '', lng: '' })
  const [savingEdit, setSavingEdit] = useState(false)
  const editPhotoInputRef = useRef<HTMLInputElement>(null)

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleteName, setDeleteName] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { fetchClientes(); fetchVendedores(); fetchEmpresas() }, [])

  async function fetchClientes() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/clientes')
      if (res.ok) {
        const data = await res.json()
        setClientes(data.clientes || [])
        setTotal(data.total || 0)
      }
    } catch { toast.error('Error al cargar clientes') }
    finally { setLoading(false) }
  }

  async function fetchVendedores() {
    try {
      const res = await fetch('/api/admin/users?role=VENDEDOR')
      if (res.ok) setVendedores(await res.json())
    } catch {}
  }

  async function fetchEmpresas() {
    try {
      const res = await fetch('/api/admin/empresas')
      if (res.ok) setEmpresas(await res.json())
    } catch {}
  }

  async function handlePhotoSelect(file: File, target: 'create' | 'edit') {
    if (!file) return
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|gif)$/)) { toast.error('Formato no soportado'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Imagen demasiado grande. Máx 2MB'); return }
    setUploadingPhoto(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const res = await fetch('/api/admin/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: e.target?.result }) })
        if (res.ok) {
          const data = await res.json()
          if (target === 'create') setFormPhoto(data.url); else setEditPhoto(data.url)
          toast.success('Foto cargada')
        } else toast.error('Error al subir foto')
      } catch { toast.error('Error al subir foto') }
      finally { setUploadingPhoto(false) }
    }
    reader.readAsDataURL(file)
  }

  async function geocodificar(provincia: string, ciudad: string, direccion: string, target: 'create' | 'edit') {
    if (!provincia && !ciudad && !direccion) return
    const fullAddr = `${provincia}|${ciudad}|${direccion}`
    if (fullAddr === lastGeocoded) return
    setLastGeocoded(fullAddr)
    setGeocoding(true)
    try {
      const res = await fetch('/api/admin/geocode', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provincia, ciudad, direccion }) })
      const data = await res.json()
      if (data.lat && data.lng) {
        if (target === 'create') setFormCoords({ lat: data.lat, lng: data.lng })
        else setEditCoords({ lat: data.lat, lng: data.lng })
        toast.success(`Ubicación actualizada: ${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`)
      } else {
        const currentLat = target === 'create' ? formCoords.lat : editCoords.lat
        if (currentLat !== '') toast.info('No se actualizó. Se mantiene la coordenada guardada.')
        else toast.warning('No se encontró la dirección. Podés seleccionar la ubicación manualmente en el mapa.')
      }
    } catch { toast.error('Error al geocodificar') }
    finally { setGeocoding(false) }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/clientes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          photoUrl: formPhoto,
          latitude: formCoords.lat !== '' ? formCoords.lat : undefined,
          longitude: formCoords.lng !== '' ? formCoords.lng : undefined,
          address: form.direccion,
        }),
      })
      if (res.ok) {
        toast.success('Cliente creado')
        setDialogOpen(false)
        setForm({ name: '', email: '', telefono: '', dni: '', provincia: '', ciudad: '', direccion: '', notas: '', empresaId: '', ownerId: '', status: 'NUEVO' })
        setFormPhoto(null); setFormCoords({ lat: '', lng: '' })
        fetchClientes()
      } else { const err = await res.json(); toast.error(err.error || 'Error al crear') }
    } catch { toast.error('Error de conexión') }
  }

  function openEdit(c: Cliente) {
    setEditId(c.id)
    setEditForm({
      name: c.name, email: c.primaryEmail || '', telefono: c.primaryPhone || '',
      dni: c.dni || '', provincia: c.province || '', ciudad: c.city || '',
      direccion: '', notas: '', empresaId: c.empresaId || '', ownerId: c.ownerId || '',
      status: c.status,
    })
    setEditPhoto(c.photoUrl || null)
    // Fetch full detail to get address, notas, lat/lng
    fetch(`/api/admin/clientes/${c.id}`).then(r => r.ok ? r.json() : null).then(data => {
      if (data) {
        setEditForm(prev => ({
          ...prev,
          direccion: data.address || '',
          notas: data.notas || '',
          empresaId: data.empresaId || '',
          ownerId: data.ownerId || '',
          status: data.status || 'NUEVO',
        }))
        setEditCoords({ lat: data.latitude ?? '', lng: data.longitude ?? '' })
        setLastGeocoded(`${data.province || ''}|${data.city || ''}|${data.address || ''}`)
      }
    })
    setEditDialogOpen(true)
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/admin/clientes/${editId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          photoUrl: editPhoto,
          latitude: editCoords.lat !== '' ? Number(editCoords.lat) : null,
          longitude: editCoords.lng !== '' ? Number(editCoords.lng) : null,
          address: editForm.direccion,
        }),
      })
      if (res.ok) { toast.success('Cliente actualizado'); setEditDialogOpen(false); fetchClientes() }
      else { const err = await res.json(); toast.error(err.error || 'Error al actualizar') }
    } catch { toast.error('Error de conexión') }
    finally { setSavingEdit(false) }
  }

  function openDelete(c: Cliente) { setDeleteTarget(c.id); setDeleteName(c.name) }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/clientes/${deleteTarget}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Cliente eliminado'); setDeleteTarget(null); fetchClientes() }
      else { const err = await res.json(); toast.error(err.error || 'Error al eliminar') }
    } catch { toast.error('Error de conexión') }
    finally { setDeleting(false) }
  }

  // Filtrar vendedores activos que cubren la provincia seleccionada
  const vendedoresDisponibles = (provincia: string) => {
    if (!provincia) return vendedores.filter(v => v.activo)
    return vendedores.filter(v => {
      if (!v.activo) return false
      if (!v.coverageAreas) return true // sin cobertura = cubre todo
      return v.coverageAreas.toLowerCase().includes(provincia.toLowerCase().split(' ')[0])
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Clientes</h1>
          <p className="text-sm text-muted-foreground">Gestión de clientes ({total} total)</p>
        </div>
        <Button onClick={() => { setLastGeocoded(''); setDialogOpen(true) }} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nuevo cliente
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-muted-foreground col-span-full text-center py-8">Cargando...</p>
        ) : clientes.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" /> No hay clientes
          </p>
        ) : (
          (search ? clientes.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.primaryEmail?.toLowerCase().includes(search.toLowerCase())) : clientes).map((c) => {
            const vendedor = vendedores.find(v => v.id === c.ownerId)
            const empresa = empresas.find(e => e.id === c.empresaId)
            return (
              <Card key={c.id}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20 border">
                      <AvatarImage src={c.photoUrl || undefined} alt={c.name} />
                      <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">{c.name[0]?.toUpperCase() || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{c.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{c.primaryEmail || '—'}</p>
                      {c.primaryPhone && <p className="text-xs text-muted-foreground truncate">{c.primaryPhone}</p>}
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <Badge className={`text-xs ${STATUS_COLORS[c.status] || 'bg-gray-500/15 text-gray-600'}`}>{STATUS_LABELS[c.status] || c.status}</Badge>
                        {c.province && <Badge variant="outline" className="text-xs"><MapPin className="h-2.5 w-2.5 mr-0.5" />{c.province}</Badge>}
                      </div>
                    </div>
                  </div>
                  {vendedor && <p className="text-xs text-muted-foreground mt-2">👤 Vendedor: {vendedor.nombre} {vendedor.apellido}</p>}
                  {empresa && <p className="text-xs text-muted-foreground">🏢 Empresa: {empresa.nombre}</p>}
                  <div className="grid grid-cols-3 gap-1 mt-3">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/admin/clientes/${c.id}`)} title="Ver detalle"><Eye className="h-3.5 w-3.5" /></Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(c)} title="Editar"><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="outline" size="sm" onClick={() => openDelete(c)} title="Eliminar" className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* === MODAL CREAR === */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nuevo cliente</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Foto */}
            <div className="space-y-2">
              <Label>Foto (opcional)</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24 border">
                  <AvatarImage src={formPhoto || undefined} alt="Preview" />
                  <AvatarFallback className="bg-muted"><Camera className="h-8 w-8 text-muted-foreground" /></AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => e.target.files?.[0] && handlePhotoSelect(e.target.files[0], 'create')} className="hidden" />
                  <Button type="button" variant="outline" size="sm" onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}>
                    <Camera className="h-4 w-4 mr-2" />{uploadingPhoto ? 'Subiendo...' : (formPhoto ? 'Cambiar foto' : 'Subir foto')}
                  </Button>
                  {formPhoto && <Button type="button" variant="ghost" size="sm" onClick={() => setFormPhoto(null)} className="ml-2 text-red-600">Quitar</Button>}
                </div>
              </div>
            </div>

            <div className="space-y-2"><Label>Nombre *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Teléfono</Label><Input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>DNI</Label><Input value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} placeholder="12345678" /></div>
              <div className="space-y-2"><Label>Estado</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NUEVO">Nuevo</SelectItem>
                    <SelectItem value="EN_CONTACTO">En contacto</SelectItem>
                    <SelectItem value="ATENDIDO">Atendido</SelectItem>
                    <SelectItem value="RECHAZADO">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Ubicación</h3>
              <div className="space-y-3">
                <div className="space-y-2"><Label>Provincia</Label>
                  <Select value={form.provincia || '_none'} onValueChange={(v) => setForm({ ...form, provincia: v === '_none' ? '' : v })}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar provincia" /></SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto"><SelectItem value="_none">— Sin provincia —</SelectItem>{PROVINCIAS_ARGENTINA.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Ciudad</Label><Input value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} placeholder="Posadas" /></div>
                <div className="space-y-2"><Label>Dirección</Label>
                  <div className="flex gap-2">
                    <Input value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} placeholder="Av. Santa Fe 1234" onBlur={() => geocodificar(form.provincia, form.ciudad, form.direccion, 'create')} />
                    <Button type="button" variant="outline" size="sm" onClick={() => geocodificar(form.provincia, form.ciudad, form.direccion, 'create')} disabled={geocoding}>{geocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}</Button>
                  </div>
                  {formCoords.lat !== '' && formCoords.lng !== '' && (
                    <p className="text-xs text-muted-foreground">📍 {formCoords.lat}, {formCoords.lng}</p>
                  )}
                </div>
                {formCoords.lat !== '' && formCoords.lng !== '' && (
                  <LeafletMap lat={Number(formCoords.lat)} lng={Number(formCoords.lng)} label={form.name || 'Nuevo cliente'} height="180px" draggable onDragEnd={(lat, lng) => { setFormCoords({ lat, lng }); toast.info(`Ubicación ajustada: ${lat.toFixed(4)}, ${lng.toFixed(4)}`) }} onClick={(lat, lng) => { setFormCoords({ lat, lng }); toast.info(`Ubicación seleccionada: ${lat.toFixed(4)}, ${lng.toFixed(4)}`) }} />
                )}
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <h3 className="text-sm font-semibold">Asignaciones</h3>
              <div className="space-y-2"><Label>Vendedor asignado</Label>
                <Select value={form.ownerId || '_none'} onValueChange={(v) => setForm({ ...form, ownerId: v === '_none' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto"><SelectItem value="_none">— Sin asignar —</SelectItem>{vendedoresDisponibles(form.provincia).map((v) => <SelectItem key={v.id} value={v.id}>{v.nombre} {v.apellido || ''}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Empresa</Label>
                <Select value={form.empresaId || '_none'} onValueChange={(v) => setForm({ ...form, empresaId: v === '_none' ? '' : v })}>
                  <SelectTrigger><SelectValue placeholder="Sin empresa" /></SelectTrigger>
                  <SelectContent><SelectItem value="_none">— Sin empresa —</SelectItem>{empresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2"><Label>Notas</Label><Textarea value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Notas adicionales sobre el cliente..." rows={3} /></div>

            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button type="submit">Crear cliente</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* === MODAL EDITAR === */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar cliente</DialogTitle></DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Foto</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24 border"><AvatarImage src={editPhoto || undefined} alt="Preview" /><AvatarFallback className="bg-muted"><Camera className="h-8 w-8 text-muted-foreground" /></AvatarFallback></Avatar>
                <div className="flex-1">
                  <input ref={editPhotoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => e.target.files?.[0] && handlePhotoSelect(e.target.files[0], 'edit')} className="hidden" />
                  <Button type="button" variant="outline" size="sm" onClick={() => editPhotoInputRef.current?.click()} disabled={uploadingPhoto}><Camera className="h-4 w-4 mr-2" />{uploadingPhoto ? 'Subiendo...' : (editPhoto ? 'Cambiar foto' : 'Subir foto')}</Button>
                  {editPhoto && <Button type="button" variant="ghost" size="sm" onClick={() => setEditPhoto(null)} className="ml-2 text-red-600">Quitar</Button>}
                </div>
              </div>
            </div>
            <div className="space-y-2"><Label>Nombre *</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Email</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div><div className="space-y-2"><Label>Teléfono</Label><Input value={editForm.telefono} onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })} /></div></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>DNI</Label><Input value={editForm.dni} onChange={(e) => setEditForm({ ...editForm, dni: e.target.value })} /></div>
              <div className="space-y-2"><Label>Estado</Label><Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NUEVO">Nuevo</SelectItem><SelectItem value="EN_CONTACTO">En contacto</SelectItem><SelectItem value="ATENDIDO">Atendido</SelectItem><SelectItem value="RECHAZADO">Rechazado</SelectItem></SelectContent></Select></div>
            </div>
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Ubicación</h3>
              <div className="space-y-3">
                <div className="space-y-2"><Label>Provincia</Label><Select value={editForm.provincia || '_none'} onValueChange={(v) => setEditForm({ ...editForm, provincia: v === '_none' ? '' : v })}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent className="max-h-60 overflow-y-auto"><SelectItem value="_none">— Sin provincia —</SelectItem>{PROVINCIAS_ARGENTINA.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Ciudad</Label><Input value={editForm.ciudad} onChange={(e) => setEditForm({ ...editForm, ciudad: e.target.value })} /></div>
                <div className="space-y-2"><Label>Dirección</Label><div className="flex gap-2"><Input value={editForm.direccion} onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })} onBlur={() => geocodificar(editForm.provincia, editForm.ciudad, editForm.direccion, 'edit')} /><Button type="button" variant="outline" size="sm" onClick={() => geocodificar(editForm.provincia, editForm.ciudad, editForm.direccion, 'edit')} disabled={geocoding}>{geocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}</Button></div>
                  {editCoords.lat !== '' && editCoords.lng !== '' && <p className="text-xs text-muted-foreground">📍 {editCoords.lat}, {editCoords.lng}</p>}
                </div>
                {editCoords.lat !== '' && editCoords.lng !== '' && (
                  <LeafletMap lat={Number(editCoords.lat)} lng={Number(editCoords.lng)} label={editForm.name || 'Cliente'} height="180px" draggable onDragEnd={(lat, lng) => { setEditCoords({ lat, lng }); toast.info(`Ubicación ajustada`) }} onClick={(lat, lng) => { setEditCoords({ lat, lng }); toast.info(`Ubicación seleccionada`) }} />
                )}
              </div>
            </div>
            <div className="border-t pt-4 space-y-3">
              <h3 className="text-sm font-semibold">Asignaciones</h3>
              <div className="space-y-2"><Label>Vendedor asignado</Label><Select value={editForm.ownerId || '_none'} onValueChange={(v) => setEditForm({ ...editForm, ownerId: v === '_none' ? '' : v })}><SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger><SelectContent className="max-h-60 overflow-y-auto"><SelectItem value="_none">— Sin asignar —</SelectItem>{vendedoresDisponibles(editForm.provincia).map((v) => <SelectItem key={v.id} value={v.id}>{v.nombre} {v.apellido || ''}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Empresa</Label><Select value={editForm.empresaId || '_none'} onValueChange={(v) => setEditForm({ ...editForm, empresaId: v === '_none' ? '' : v })}><SelectTrigger><SelectValue placeholder="Sin empresa" /></SelectTrigger><SelectContent><SelectItem value="_none">— Sin empresa —</SelectItem>{empresas.map((e) => <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Notas</Label><Textarea value={editForm.notas} onChange={(e) => setEditForm({ ...editForm, notas: e.target.value })} rows={3} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={savingEdit}>{savingEdit ? 'Guardando...' : 'Guardar cambios'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* === DIALOG ELIMINAR === */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Eliminar cliente</DialogTitle><DialogDescription>¿Eliminar a <strong>{deleteName}</strong>? Esta acción no se puede deshacer. Si tiene tareas asignadas, deberás reasignarlas primero.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button><Button variant="destructive" onClick={handleDelete} disabled={deleting}><Trash2 className="h-4 w-4 mr-2" /> {deleting ? 'Eliminando...' : 'Eliminar'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
