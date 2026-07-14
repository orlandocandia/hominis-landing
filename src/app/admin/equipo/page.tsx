'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users, Building2, Phone, Loader2, RefreshCw, Eye, ListTodo, ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Vendedor {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  avatarUrl: string | null;
  activo: number | boolean;
  empresaNombre: string | null;
  totalLeads: number;
  leadsAtendidos: number;
  tareasPendientes: number;
  tareasCompletadas: number;
}

interface Stats {
  totalVendedores: number;
  totalLeads: number;
  totalTareas: number;
}

export default function EquipoPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ totalVendedores: 0, totalLeads: 0, totalTareas: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [vendedoresRes, statsRes] = await Promise.all([
        fetch('/api/admin/users?limit=50', { cache: 'no-store' }),
        fetch('/api/admin/stats/equipo', { cache: 'no-store' }),
      ]);

      if (!vendedoresRes.ok || !statsRes.ok) throw new Error();

      const vendedoresData = await vendedoresRes.json();
      const statsData = await statsRes.json();

      setVendedores(vendedoresData.users || []);
      setStats({
        totalVendedores: statsData.totalVendedores || 0,
        totalLeads: statsData.totalLeads || 0,
        totalTareas: statsData.totalTareas || 0,
      });
    } catch {
      toast.error('Error al cargar datos del equipo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-56 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </span>
            Equipo de Ventas
          </h1>
          <p className="text-sm text-muted-foreground">{stats.totalVendedores} vendedores activos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Actualizar
          </Button>
          <Button asChild className="gap-2">
            <Link href="/admin/vendedores/nuevo"><Users className="h-4 w-4" /> Nuevo Vendedor</Link>
          </Button>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Vendedores</p>
              <p className="mt-1 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.totalVendedores}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-violet-200/60 bg-violet-50/50 dark:border-violet-900/40 dark:bg-violet-950/20">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Leads totales</p>
              <p className="mt-1 text-3xl font-bold text-violet-600 dark:text-violet-400">{stats.totalLeads}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600">
              <ClipboardList className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200/60 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Tareas pendientes</p>
              <p className="mt-1 text-3xl font-bold text-amber-600 dark:text-amber-400">{stats.totalTareas}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600">
              <ListTodo className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de vendedores */}
      {vendedores.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Users className="h-10 w-10 opacity-50" />
            <p>No hay vendedores para mostrar</p>
            <Button variant="link" asChild>
              <Link href="/admin/vendedores/nuevo">Crear tu primer vendedor →</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vendedores.map((v) => {
            const isActive = Boolean(v.activo);
            const initials = v.nombre?.charAt(0)?.toUpperCase() || v.email.charAt(0).toUpperCase();
            return (
              <Card key={v.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{v.nombre}</p>
                      <p className="truncate text-xs text-muted-foreground">{v.email}</p>
                      <Badge
                        variant="secondary"
                        className={
                          isActive
                            ? 'border-transparent bg-emerald-500/15 text-emerald-600'
                            : 'text-zinc-500'
                        }
                      >
                        {isActive ? '🟢 Activo' : '🔴 Inactivo'}
                      </Badge>
                    </div>
                  </div>

                  {/* Datos */}
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {v.telefono && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0" /> {v.telefono}
                      </p>
                    )}
                    {v.empresaNombre && (
                      <p className="flex items-center gap-2 truncate">
                        <Building2 className="h-3.5 w-3.5 shrink-0" /> {v.empresaNombre}
                      </p>
                    )}
                  </div>

                  {/* Métricas */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{v.totalLeads || 0}</p>
                      <p className="text-[11px] text-muted-foreground">Leads</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{v.tareasPendientes || 0}</p>
                      <p className="text-[11px] text-muted-foreground">Pendientes</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{v.tareasCompletadas || 0}</p>
                      <p className="text-[11px] text-muted-foreground">Completadas</p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                    <Button size="sm" variant="outline" asChild className="gap-1 text-xs">
                      <Link href={`/admin/vendedores/${v.id}`}>
                        <Eye className="h-3.5 w-3.5" /> Ver
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild className="gap-1 text-xs">
                      <Link href={`/admin/tareas?asignadoA=${v.id}`}>
                        <ListTodo className="h-3.5 w-3.5" /> Tareas
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild className="gap-1 text-xs">
                      <Link href={`/admin/leads?ownerId=${v.id}`}>
                        <ClipboardList className="h-3.5 w-3.5" /> Leads
                      </Link>
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
