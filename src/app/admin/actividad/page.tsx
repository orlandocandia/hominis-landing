'use client';

// /admin/actividad — Historial completo de actividades con filtros + export CSV.
import { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, ChevronLeft, ChevronRight, Loader2,
  Download, Filter, X, Calendar, User, Tag, Clock, Activity as ActivityIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const ACTION_ICONS: Record<string, string> = {
  CREADO: '📝', NUEVO: '🆕', LEIDO: '👀', EN_CONTACTO: '💬', REUNION: '🤝',
  PRESUPUESTO: '💰', ATENDIDO: '✅', RECHAZADO: '❌', TAREA_COMPLETADA: '🎯',
  WHATSAPP: '💬', LLAMADA: '📞', EMAIL: '✉️', VISITA: '📍', NOTA: '📋', REASIGNACION: '🔄',
};

const ACTION_COLORS: Record<string, string> = {
  CREADO: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  NUEVO: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  LEIDO: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  EN_CONTACTO: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  REUNION: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400',
  PRESUPUESTO: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  ATENDIDO: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  RECHAZADO: 'bg-zinc-500/15 text-zinc-500',
  TAREA_COMPLETADA: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  WHATSAPP: 'bg-green-500/15 text-green-600 dark:text-green-400',
  LLAMADA: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  EMAIL: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  VISITA: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  NOTA: 'bg-zinc-500/15 text-zinc-500',
  REASIGNACION: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
};

const ACTION_LABELS: Record<string, string> = {
  CREADO: '📝 Creó lead', NUEVO: '🆕 Lead nuevo', LEIDO: '👀 Marcó como leído',
  EN_CONTACTO: '💬 En contacto', REUNION: '🤝 Reunión agendada',
  PRESUPUESTO: '💰 Presupuesto enviado', ATENDIDO: '✅ Marcó como atendido',
  RECHAZADO: '❌ Rechazó lead', TAREA_COMPLETADA: '🎯 Completó tarea',
  WHATSAPP: '💬 Envió WhatsApp', LLAMADA: '📞 Realizó llamada',
  EMAIL: '✉️ Envió email', VISITA: '📍 Registró visita',
  NOTA: '📋 Agregó nota', REASIGNACION: '🔄 Reasignó lead',
};

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'hace instantes';
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `hace ${days} d`;
    const months = Math.floor(days / 30);
    return `hace ${months} meses`;
  } catch { return '—'; }
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  } catch { return '—'; }
}

export default function ActividadPage() {
  const [actividades, setActividades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [filtros, setFiltros] = useState({
    action: '', vendedorId: '', search: '', fechaDesde: '', fechaHasta: '',
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: 20 });
  const [exportando, setExportando] = useState(false);

  const fetchActividad = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pagination.page), limit: String(pagination.limit) });
      if (filtros.action) params.set('action', filtros.action);
      if (filtros.vendedorId) params.set('vendedorId', filtros.vendedorId);
      if (filtros.search) params.set('search', filtros.search);
      if (filtros.fechaDesde) params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params.set('fechaHasta', filtros.fechaHasta);

      const res = await fetch(`/api/admin/actividad?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setActividades(data.actividades || []);
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 1, limit: 20 });
    } catch {
      toast.error('Error al cargar actividad');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filtros]);

  useEffect(() => { fetchActividad(); }, [fetchActividad]);

  useEffect(() => {
    fetch('/api/admin/users?limit=50')
      .then((r) => r.json())
      .then((data) => setVendedores(data.users || []))
      .catch(() => {});
  }, []);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimpiarFiltros = () => {
    setFiltros({ action: '', vendedorId: '', search: '', fechaDesde: '', fechaHasta: '' });
  };

  const handleExport = async () => {
    setExportando(true);
    try {
      const params = new URLSearchParams();
      if (filtros.action) params.set('action', filtros.action);
      if (filtros.vendedorId) params.set('vendedorId', filtros.vendedorId);
      if (filtros.search) params.set('search', filtros.search);
      if (filtros.fechaDesde) params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params.set('fechaHasta', filtros.fechaHasta);

      const res = await fetch(`/api/admin/actividad/export?${params}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `actividad_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exportado');
    } catch {
      toast.error('Error al exportar');
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ActivityIcon className="h-5 w-5 text-primary" />
            </span>
            Actividad
          </h1>
          <p className="text-sm text-muted-foreground">{pagination.total} acciones registradas</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setMostrarFiltros(!mostrarFiltros)} className="gap-2 text-sm">
            <Filter className="h-4 w-4" /> Filtros
            {Object.values(filtros).some((v) => v) && (
              <span className="h-2 w-2 rounded-full bg-primary" />
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportando || (actividades.length === 0 && !loading)}
            className="gap-2 text-sm"
          >
            {exportando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {exportando ? 'Exportando...' : 'Exportar CSV'}
          </Button>
          <Button variant="outline" onClick={fetchActividad} className="gap-2 text-sm">
            <RefreshCw className="h-4 w-4" /> Actualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap gap-3">
              <div className="min-w-[150px] flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Acción</label>
                <select
                  value={filtros.action}
                  onChange={(e) => setFiltros({ ...filtros, action: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Todas las acciones</option>
                  {Object.entries(ACTION_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-[150px] flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Vendedor</label>
                <select
                  value={filtros.vendedorId}
                  onChange={(e) => setFiltros({ ...filtros, vendedorId: e.target.value })}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Todos</option>
                  {vendedores.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} {v.apellido || ''}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-[150px] flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Lead, vendedor o nota..."
                    value={filtros.search}
                    onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && fetchActividad()}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Fecha desde</label>
                <Input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                  className="w-auto"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Fecha hasta</label>
                <Input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                  className="w-auto"
                />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={fetchActividad}>Aplicar</Button>
                <Button variant="outline" onClick={handleLimpiarFiltros}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : actividades.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Clock className="h-10 w-10 opacity-50" />
            <p>No hay actividad con estos filtros</p>
            <p className="text-sm">Las acciones de vendedores aparecerán aquí</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {actividades.map((act) => {
            const userName = [act.userName, act.userApellido].filter(Boolean).join(' ') || 'Sistema';
            return (
              <Card key={act.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${ACTION_COLORS[act.action] || 'bg-zinc-500/15'}`}>
                      {ACTION_ICONS[act.action] || '📌'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{userName}</span>
                        <span className="text-sm text-muted-foreground">
                          {ACTION_LABELS[act.action] || act.action}
                        </span>
                        {act.contactName && (
                          <span className="text-sm text-muted-foreground">
                            a <span className="font-medium text-foreground">{act.contactName}</span>
                          </span>
                        )}
                      </div>
                      {act.note && (
                        <p className="mt-1 rounded-lg bg-muted/30 p-2 text-sm text-muted-foreground">
                          💬 {act.note}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {timeAgo(act.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> {formatDateTime(act.createdAt)}
                        </span>
                        {act.contactName && (
                          <span className="flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5" /> {act.contactName}
                          </span>
                        )}
                        {act.userEmail && (
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" /> {act.userEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" disabled={pagination.page === 1} onClick={() => handlePageChange(pagination.page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="rounded-lg bg-primary/10 px-3 py-1 text-sm">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button variant="outline" size="icon" disabled={pagination.page === pagination.totalPages} onClick={() => handlePageChange(pagination.page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
