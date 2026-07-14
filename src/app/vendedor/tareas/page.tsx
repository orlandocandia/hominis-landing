'use client';

// /vendedor/tareas — Mis Tareas (lista paginada, filtros, completar).
import { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, ChevronLeft, ChevronRight, Loader2,
  CheckCircle2, Calendar, Tag, ListTodo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const ESTADO_COLORS: Record<string, string> = {
  PENDIENTE: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  EN_PROGRESO: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  COMPLETADA: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  CANCELADA: 'bg-zinc-500/15 text-zinc-500',
};

const PRIORIDAD_COLORS: Record<string, string> = {
  ALTA: 'bg-red-500/15 text-red-600 dark:text-red-400',
  MEDIA: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  BAJA: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  } catch { return '—'; }
}

export default function VendedorTareasPage() {
  const [tareas, setTareas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ estado: '', prioridad: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: 10 });

  const fetchTareas = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pagination.page), limit: String(pagination.limit) });
      if (filtros.estado) params.set('estado', filtros.estado);
      if (filtros.prioridad) params.set('prioridad', filtros.prioridad);
      if (filtros.search) params.set('search', filtros.search);

      const res = await fetch(`/api/vendedor/tareas?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTareas(data.tareas || []);
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 1, limit: 10 });
    } catch {
      toast.error('Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filtros]);

  useEffect(() => { fetchTareas(); }, [fetchTareas]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleComplete = async (id: string) => {
    try {
      const res = await fetch(`/api/vendedor/tareas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'COMPLETADA' }),
      });
      if (!res.ok) throw new Error();
      toast.success('¡Tarea completada! 🎉');
      fetchTareas();
    } catch {
      toast.error('Error al completar');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ListTodo className="h-5 w-5 text-primary" />
            </span>
            Mis Tareas
          </h1>
          <p className="text-sm text-muted-foreground">{pagination.total} tareas</p>
        </div>
        <Button variant="outline" onClick={fetchTareas} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarea..."
            value={filtros.search}
            onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && fetchTareas()}
            className="pl-9"
          />
        </div>
        <select
          value={filtros.estado}
          onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          className="rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">⏳ Pendiente</option>
          <option value="EN_PROGRESO">🔄 En progreso</option>
          <option value="COMPLETADA">✅ Completada</option>
          <option value="CANCELADA">❌ Cancelada</option>
        </select>
        <select
          value={filtros.prioridad}
          onChange={(e) => setFiltros({ ...filtros, prioridad: e.target.value })}
          className="rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground"
        >
          <option value="">Todas las prioridades</option>
          <option value="ALTA">🔴 Alta</option>
          <option value="MEDIA">🟡 Media</option>
          <option value="BAJA">🟢 Baja</option>
        </select>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : tareas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 opacity-50" />
            <p>No tenés tareas</p>
            <p className="text-sm">Las tareas asignadas aparecerán aquí</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tareas.map((tarea) => {
            const isVencida = tarea.fechaLimite && new Date(tarea.fechaLimite) < new Date() && tarea.estado !== 'COMPLETADA' && tarea.estado !== 'CANCELADA';
            return (
              <Card key={tarea.id} className={isVencida ? 'border-red-300 dark:border-red-900' : ''}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{tarea.titulo}</h3>
                      <Badge variant="secondary" className={ESTADO_COLORS[tarea.estado] || ''}>
                        {tarea.estado.replace('_', ' ')}
                      </Badge>
                      <Badge variant="secondary" className={PRIORIDAD_COLORS[tarea.prioridad] || ''}>
                        {tarea.prioridad}
                      </Badge>
                      {isVencida && (
                        <Badge variant="destructive" className="text-[10px]">⚠️ Vencida</Badge>
                      )}
                    </div>
                    {tarea.descripcion && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tarea.descripcion}</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className={`flex items-center gap-1 ${isVencida ? 'font-medium text-red-500' : ''}`}>
                        <Calendar className="h-3.5 w-3.5" /> {formatDate(tarea.fechaLimite)}
                      </span>
                      {tarea.contactoNombre && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5" /> {tarea.contactoNombre}
                        </span>
                      )}
                    </div>
                  </div>
                  {tarea.estado !== 'COMPLETADA' && tarea.estado !== 'CANCELADA' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleComplete(tarea.id)}
                      className="gap-1 text-xs text-emerald-600"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Completar
                    </Button>
                  )}
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
