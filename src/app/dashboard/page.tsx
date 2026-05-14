'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LogOut,
  User,
  Mail,
  Phone,
  Search,
  Filter,
  MessageSquare,
  Users,
  CheckCircle2,
  Clock,
  Eye,
  Trash2,
  ExternalLink,
  RefreshCw,
  Bell,
  ChevronLeft,
  ChevronRight,
  Shield,
  Calendar,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Types ─── */
interface Contact {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  segmento: string;
  mensaje: string | null;
  cobertura: string | null;
  edad: number | null;
  origen: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Stats {
  NUEVO: number;
  LEIDO: number;
  ATENDIDO: number;
}

/* ─── Segmento labels ─── */
const SEGMENTO_LABELS: Record<string, string> = {
  RECIBO_DE_SUELDO: 'Recibo de sueldo',
  MONOTRIBUTO: 'Monotributo',
  PARTICULAR: 'Particular',
};

/* ─── Estado config ─── */
const ESTADO_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof Bell }> = {
  NUEVO: { label: 'Nuevo', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-200', icon: Bell },
  LEIDO: { label: 'Leído', color: 'text-amber-700', bgColor: 'bg-amber-100 border-amber-200', icon: Eye },
  ATENDIDO: { label: 'Atendido', color: 'text-green-700', bgColor: 'bg-green-100 border-green-200', icon: CheckCircle2 },
};

/* ─── Stats Card Component ─── */
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string;
  value: number;
  icon: typeof Users;
  color: string;
  bgColor: string;
}) {
  return (
    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Contact Detail Dialog ─── */
function ContactDetailDialog({
  contact,
  open,
  onClose,
  onStatusChange,
}: {
  contact: Contact | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, estado: string) => void;
}) {
  if (!contact) return null;

  const estadoInfo = ESTADO_CONFIG[contact.estado] || ESTADO_CONFIG.NUEVO;
  const EstadoIcon = estadoInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-hominis-blue to-hominis-violet flex items-center justify-center text-white font-bold text-sm">
              {contact.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg">{contact.nombre}</p>
              <p className="text-xs text-muted-foreground font-normal">{contact.email}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <Badge className={`${estadoInfo.bgColor} ${estadoInfo.color} border font-medium`}>
              <EstadoIcon className="w-3.5 h-3.5 mr-1" />
              {estadoInfo.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(contact.createdAt).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <Separator />

          {/* Contact details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{contact.telefono}</span>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{SEGMENTO_LABELS[contact.segmento] || contact.segmento}</span>
            </div>
            {contact.cobertura && (
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{contact.cobertura}</span>
              </div>
            )}
            {contact.edad && (
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{contact.edad} años</span>
              </div>
            )}
          </div>

          {/* Message */}
          {contact.mensaje && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Mensaje</p>
                <div className="bg-gray-50 rounded-xl p-4 text-sm leading-relaxed">
                  {contact.mensaje}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {/* Status change buttons */}
            <div className="flex gap-2">
              {Object.entries(ESTADO_CONFIG).map(([key, config]) => (
                <Button
                  key={key}
                  variant={contact.estado === key ? 'default' : 'outline'}
                  size="sm"
                  className={`flex-1 rounded-xl ${
                    contact.estado === key
                      ? `${config.bgColor} ${config.color} border hover:opacity-90`
                      : ''
                  }`}
                  onClick={() => onStatusChange(contact.id, key)}
                >
                  {config.label}
                </Button>
              ))}
            </div>

            {/* WhatsApp button */}
            <a
              href={`https://wa.me/${contact.telefono.replace(/[^0-9]/g, '').replace(/^0+/, '549')}?text=Hola%20${encodeURIComponent(contact.nombre)}%2C%20soy%20Agustina%20de%20Hominis.%20Te%20escribo%20por%20tu%20consulta.`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl">
                <svg viewBox="0 0 32 32" className="w-5 h-5 mr-2" fill="white"><path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.132 6.742 3.054 9.378L1.054 31.29l6.118-1.962A15.9 15.9 0 0016.004 32C24.826 32 32 24.826 32 16.004S24.826 0 16.004 0zm9.31 22.61c-.39 1.1-1.932 2.014-3.164 2.28-.844.18-1.946.324-5.66-1.216-4.748-1.97-7.804-6.78-8.038-7.094-.226-.314-1.886-2.512-1.886-4.79s1.194-3.398 1.618-3.864c.39-.428.852-.536 1.136-.536.282 0 .566.002.812.016.262.012.614-.1.96.732.356.854 1.21 2.95 1.316 3.164.108.214.18.466.036.748-.136.282-.204.458-.408.706-.214.248-.448.554-.638.744-.214.214-.436.446-.188.876.248.428 1.104 1.82 2.37 2.948 1.63 1.452 3.004 1.902 3.432 2.116.428.214.676.18.924-.108.248-.288 1.064-1.24 1.348-1.666.282-.428.566-.356.952-.214.39.142 2.478 1.168 2.902 1.382.428.214.712.322.818.498.108.178.108 1.022-.282 2.12z"/></svg>
                Contactar por WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Contact Row Component ─── */
function ContactRow({
  contact,
  onStatusChange,
  onSelect,
  onDelete,
}: {
  contact: Contact;
  onStatusChange: (id: string, estado: string) => void;
  onSelect: (contact: Contact) => void;
  onDelete: (id: string) => void;
}) {
  const estadoInfo = ESTADO_CONFIG[contact.estado] || ESTADO_CONFIG.NUEVO;
  const EstadoIcon = estadoInfo.icon;

  return (
    <div
      className="flex items-center gap-4 p-4 hover:bg-gray-50/80 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
      onClick={() => onSelect(contact)}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-hominis-blue to-hominis-violet flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {contact.nombre.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-semibold text-sm truncate">{contact.nombre}</p>
          <Badge className={`${estadoInfo.bgColor} ${estadoInfo.color} border text-[10px] px-1.5 py-0`}>
            <EstadoIcon className="w-3 h-3 mr-0.5" />
            {estadoInfo.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            {contact.email}
          </span>
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {contact.telefono}
          </span>
        </div>
        {contact.mensaje && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{contact.mensaje}</p>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] text-muted-foreground hidden sm:block">
          {new Date(contact.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
        </span>

        {/* Quick status change */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Filter className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(contact.id, 'NUEVO'); }}>
              <Bell className="w-4 h-4 mr-2 text-blue-600" /> Marcar Nuevo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(contact.id, 'LEIDO'); }}>
              <Eye className="w-4 h-4 mr-2 text-amber-600" /> Marcar Leído
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(contact.id, 'ATENDIDO'); }}>
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> Marcar Atendido
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete(contact.id); }}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/* ─── Main Dashboard Page ─── */
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<Stats>({ NUEVO: 0, LEIDO: 0, ATENDIDO: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 15, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('TODOS');
  const [segmentoFilter, setSegmentoFilter] = useState('TODOS');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (estadoFilter !== 'TODOS') params.set('estado', estadoFilter);
      if (segmentoFilter !== 'TODOS') params.set('segmento', segmentoFilter);
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());

      const res = await fetch(`/api/contacts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts);
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Error al cargar contactos');
    } finally {
      setLoading(false);
    }
  }, [search, estadoFilter, segmentoFilter, pagination.page, pagination.limit]);

  useEffect(() => {
    if (session) {
      fetchContacts();
    }
  }, [session, fetchContacts]);

  // Status change handler
  const handleStatusChange = async (id: string, estado: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado }),
      });

      if (res.ok) {
        toast.success(`Estado cambiado a ${ESTADO_CONFIG[estado]?.label || estado}`);
        fetchContacts();
        if (detailOpen && selectedContact?.id === id) {
          setSelectedContact({ ...selectedContact, estado });
        }
      } else {
        toast.error('Error al cambiar estado');
      }
    } catch {
      toast.error('Error de conexión');
    }
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás segura de eliminar este contacto? Esta acción no se puede deshacer.')) return;

    try {
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Contacto eliminado');
        fetchContacts();
        if (detailOpen && selectedContact?.id === id) {
          setDetailOpen(false);
          setSelectedContact(null);
        }
      } else {
        toast.error('Error al eliminar contacto');
      }
    } catch {
      toast.error('Error de conexión');
    }
  };

  // Open contact detail
  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setDetailOpen(true);
    // Auto mark as read if new
    if (contact.estado === 'NUEVO') {
      handleStatusChange(contact.id, 'LEIDO');
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-hominis-violet/30 border-t-hominis-violet rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const total = stats.NUEVO + stats.LEIDO + stats.ATENDIDO;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Header ─── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Title */}
            <div className="flex items-center gap-3">
              <a href="/" className="logo-shimmer logo-depth block">
                <img
                  src="/logo_hominis.png"
                  alt="Hominis"
                  className="h-10 w-auto object-contain rounded-xl"
                />
              </a>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold gradient-text">Panel de Gestión</h1>
                <p className="text-[10px] text-muted-foreground">Hominis — Asesora Comercial</p>
              </div>
            </div>

            {/* Right: User menu */}
            <div className="flex items-center gap-3">
              {/* Refresh */}
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchContacts}
                className="h-9 w-9 p-0 rounded-lg"
                title="Actualizar"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-hominis-blue to-hominis-violet flex items-center justify-center text-white text-xs font-bold">
                      {session.user?.name?.charAt(0) || 'A'}
                    </div>
                    <span className="hidden sm:inline text-xs">{session.user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold">{session.user?.name}</p>
                    <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/')}>
                    <ExternalLink className="w-4 h-4 mr-2" /> Ir al sitio
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })} className="text-red-600 focus:text-red-600">
                    <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Contactos"
            value={total}
            icon={Users}
            color="text-hominis-violet"
            bgColor="bg-purple-100"
          />
          <StatsCard
            title="Nuevos"
            value={stats.NUEVO}
            icon={Bell}
            color="text-blue-700"
            bgColor="bg-blue-100"
          />
          <StatsCard
            title="Leídos"
            value={stats.LEIDO}
            icon={Eye}
            color="text-amber-700"
            bgColor="bg-amber-100"
          />
          <StatsCard
            title="Atendidos"
            value={stats.ATENDIDO}
            icon={CheckCircle2}
            color="text-green-700"
            bgColor="bg-green-100"
          />
        </div>

        {/* Filters Bar */}
        <Card className="border-0 shadow-lg rounded-2xl mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="pl-10 h-10 rounded-xl"
                />
              </div>

              {/* Estado filter */}
              <Select
                value={estadoFilter}
                onValueChange={(v) => {
                  setEstadoFilter(v);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-xl">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="NUEVO">🆕 Nuevos</SelectItem>
                  <SelectItem value="LEIDO">👁 Leídos</SelectItem>
                  <SelectItem value="ATENDIDO">✅ Atendidos</SelectItem>
                </SelectContent>
              </Select>

              {/* Segmento filter */}
              <Select
                value={segmentoFilter}
                onValueChange={(v) => {
                  setSegmentoFilter(v);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-xl">
                  <SelectValue placeholder="Segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="RECIBO_DE_SUELDO">💼 Recibo de sueldo</SelectItem>
                  <SelectItem value="MONOTRIBUTO">📋 Monotributo</SelectItem>
                  <SelectItem value="PARTICULAR">👤 Particular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          {/* List header */}
          <div className="px-4 py-3 bg-gradient-to-r from-hominis-blue to-hominis-violet text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-semibold">
                Contactos ({pagination.total})
              </span>
            </div>
            <span className="text-xs text-white/70">
              Página {pagination.page} de {pagination.totalPages || 1}
            </span>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-hominis-violet/30 border-t-hominis-violet rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Cargando contactos...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && contacts.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-semibold text-muted-foreground mb-1">No hay contactos</p>
              <p className="text-xs text-muted-foreground">
                {search || estadoFilter !== 'TODOS' || segmentoFilter !== 'TODOS'
                  ? 'Probá con otros filtros de búsqueda'
                  : 'Los contactos del formulario aparecerán aquí'}
              </p>
            </div>
          )}

          {/* Contacts list */}
          {!loading && contacts.length > 0 && (
            <div className="max-h-[600px] overflow-y-auto">
              {contacts.map((contact) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  onStatusChange={handleStatusChange}
                  onSelect={handleSelectContact}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="rounded-xl"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
              <span className="text-xs text-muted-foreground">
                {pagination.total} contacto{pagination.total !== 1 ? 's' : ''}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="rounded-xl"
              >
                Siguiente <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </Card>
      </main>

      {/* Contact Detail Dialog */}
      <ContactDetailDialog
        contact={selectedContact}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedContact(null); }}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
