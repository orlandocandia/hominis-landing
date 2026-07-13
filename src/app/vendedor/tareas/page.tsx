'use client';

// /vendedor/tareas — Vista de tareas del vendedor (Fase 2).
// El vendedor ve sus tareas asignadas y puede marcarlas como completadas.
import { useState, useEffect, useCallback } from 'react';
import { ListTodo, CheckCircle2, Clock, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

type Tarea = {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: string;
  estado: string;
  fechaLimite: string | null;
  contactoId?: string | null;
};

const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  EN_PROGRESO: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  COMPLETADA: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  CANCELADA: 'bg-zinc-500/15 text-zinc-500',
};

const TIPO_ICON: Record<string, string> = {
  VISITA: '🏠',
  LLAMADA: '📞',
  WHATSAPP: '💬',
  EMAIL: '✉️',
  REUNION: '🤝',
  TAREA: '📌',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

export default function VendedorTareasPage() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchTareas = useCallback(async () => {
    try {
      const res = await fetch('/api/tareas', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      // La API puede devolver array directo o {tareas: [...]}
      const list: Tarea[] = Array.isArray(data) ? data : data.tareas ?? [];
      setTareas(list);
    } catch (e) {
      console.error('Error fetching tareas:', e);
      toast.error('Error al cargar tus tareas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTareas();
  }, [fetchTareas]);

  const completar = async (id: string) => {
    setCompletingId(id);
    try {
      const res = await fetch(`/api/tareas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'COMPLETADA' }),
      });
      if (!res.ok) throw new Error();
      toast.success('¡Tarea completada! 🎉');
      fetchTareas();
    } catch {
      toast.error('Error al completar la tarea');
    } finally {
      setCompletingId(null);
    }
  };

  const pendientes = tareas.filter(
    (t) => t.estado === 'PENDIENTE' || t.estado === 'EN_PROGRESO'
  );
  const completadas = tareas.filter((t) => t.estado === 'COMPLETADA');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <ListTodo className="h-7 w-7" />
          Mis Tareas
        </h1>
        <p className="text-sm text-muted-foreground">
          {pendientes.length} pendientes · {completadas.length} completadas
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : pendientes.length === 0 && completadas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 opacity-50" />
            <p>No tenés tareas asignadas.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pendientes */}
          {pendientes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Pendientes
              </h2>
              {pendientes.map((t) => {
                const overdue = isOverdue(t.fechaLimite) && t.estado !== 'COMPLETADA';
                return (
                  <Card key={t.id} className={overdue ? 'border-red-300 dark:border-red-900' : ''}>
                    <CardContent className="flex items-start justify-between gap-4 p-4">
                      <div className="flex flex-1 items-start gap-3 min-w-0">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-base">
                          {TIPO_ICON[t.tipo] ?? TIPO_ICON.TAREA}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">{t.titulo}</h3>
                            <Badge variant="secondary" className={ESTADO_COLOR[t.estado]}>
                              {t.estado.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline">{t.tipo}</Badge>
                          </div>
                          {t.descripcion && (
                            <p className="text-sm text-muted-foreground mt-1">{t.descripcion}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(t.fechaLimite)}
                            </span>
                            {overdue && (
                              <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                                <Clock className="h-3.5 w-3.5" />
                                Vencida
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => completar(t.id)}
                        disabled={completingId === t.id}
                      >
                        {completingId === t.id ? (
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-1.5 h-4 w-4" />
                        )}
                        Completar
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Completadas */}
          {completadas.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Completadas
              </h2>
              {completadas.map((t) => (
                <Card key={t.id} className="opacity-70">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-base">
                      {TIPO_ICON[t.tipo] ?? TIPO_ICON.TAREA}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground line-through opacity-60">
                        {t.titulo}
                      </h3>
                      <Badge variant="secondary" className={ESTADO_COLOR.COMPLETADA + ' mt-1'}>
                        ✓ Completada
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
