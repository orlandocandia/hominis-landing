'use client';

// /admin/equipo — Panel de Control de Vendedores (Fase 3).
// Muestra totales del equipo + tarjetas por vendedor con métricas.
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ClipboardList, ListTodo, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface VendorMetrics {
  contacts: number;
  contactsAtendidos: number;
  tareasPendientes: number;
}

interface Vendor {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  activo: boolean;
  avatarUrl: string | null;
  coverageAreas: string | null;
  fechaAlta: string | null;
  _count: VendorMetrics;
}

interface EquipoStats {
  totalVendedores: number;
  totalLeads: number;
  totalTareas: number;
  vendedores: Vendor[];
}

const COVERAGE_LABELS: Record<string, string> = {
  CABA: 'CABA',
  GBA_NORTE: 'GBA Norte',
  GBA_SUR: 'GBA Sur',
  GBA_OESTE: 'GBA Oeste',
  INTERIOR: 'Interior',
};

function parseAreas(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export default function EquipoPage() {
  const router = useRouter();
  const [stats, setStats] = useState<EquipoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/admin/stats/equipo', { cache: 'no-store' });
      if (!res.ok) throw new Error('fetch failed');
      const data = (await res.json()) as EquipoStats;
      setStats(data);
      if (isRefresh) toast.success('Datos actualizados');
    } catch (e) {
      console.error('Error fetching equipo:', e);
      toast.error('Error al cargar datos del equipo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalVendedores = stats?.totalVendedores ?? 0;
  const totalLeads = stats?.totalLeads ?? 0;
  const totalTareas = stats?.totalTareas ?? 0;
  const vendedores = stats?.vendedores ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xl">
              👥
            </span>
            Equipo de Ventas
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {totalVendedores} vendedores activos
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <ShieldCheck
              className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            Actualizar
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <a href="/admin/tareas">
              <ListTodo className="mr-2 h-4 w-4" />
              Tareas ({totalTareas})
            </a>
          </Button>
          <Button size="sm" asChild>
            <a href="/admin/vendedores/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Vendedor
            </a>
          </Button>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Vendedores</p>
                <p className="mt-1 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {totalVendedores}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-violet-200/60 bg-violet-50/50 dark:border-violet-900/40 dark:bg-violet-950/20">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Leads totales</p>
                <p className="mt-1 text-3xl font-bold text-violet-600 dark:text-violet-400">
                  {totalLeads}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
                <ClipboardList className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200/60 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Tareas pendientes</p>
                <p className="mt-1 text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {totalTareas}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <ListTodo className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vendor grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      ) : vendedores.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-5xl">👀</p>
            <p className="text-muted-foreground">No hay vendedores registrados</p>
            <Button variant="link" asChild>
              <a href="/admin/vendedores/nuevo">Crear tu primer vendedor →</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vendedores.map((v) => {
            const fullName = [v.nombre, v.apellido].filter(Boolean).join(' ') || v.email;
            const initials =
              v.nombre
                ?.split(' ')
                .map((p) => p[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() ||
              v.email.slice(0, 2).toUpperCase();
            const areas = parseAreas(v.coverageAreas);

            return (
              <Card key={v.id} className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-foreground">{fullName}</h3>
                      <p className="truncate text-sm text-muted-foreground">{v.email}</p>
                      <div className="mt-1.5">
                        <Badge
                          variant="secondary"
                          className={
                            v.activo
                              ? 'border-transparent bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
                              : ''
                          }
                        >
                          {v.activo ? '🟢 Activo' : '🔴 Inactivo'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Coverage areas */}
                  {areas.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {areas.map((a) => (
                        <span
                          key={a}
                          className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                        >
                          {COVERAGE_LABELS[a] ?? a}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Metrics */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                    <div>
                      <p className="text-xl font-bold text-foreground">{v._count.contacts}</p>
                      <p className="text-[11px] text-muted-foreground">Leads</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {v._count.contactsAtendidos}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Atendidos</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                        {v._count.tareasPendientes}
                      </p>
                      <p className="text-[11px] text-muted-foreground">Tareas</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/admin/tareas?asignadoA=${v.id}`)}
                    >
                      <ListTodo className="mr-1.5 h-3.5 w-3.5" />
                      Tareas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => toast.info(`Leads de ${fullName}`)}
                    >
                      <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
                      Leads
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/vendedores/${v.id}`)}
                    >
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
