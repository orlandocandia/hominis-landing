'use client';

// /vendedor — Dashboard del vendedor con stats + tareas/leads recientes.
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowRight, Loader2, CheckCircle2, Users } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const PRIORIDAD_COLOR: Record<string, string> = {
  ALTA: 'bg-red-500/15 text-red-600',
  MEDIA: 'bg-amber-500/15 text-amber-600',
  BAJA: 'bg-emerald-500/15 text-emerald-600',
};

export default function VendedorDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    tareasPendientes: 0, tareasCompletadas: 0, leadsTotal: 0, leadsAtendidos: 0,
  });
  const [tareasRecientes, setTareasRecientes] = useState<any[]>([]);
  const [leadsRecientes, setLeadsRecientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tareasRes, leadsRes] = await Promise.all([
          fetch('/api/vendedor/stats', { cache: 'no-store' }),
          fetch('/api/vendedor/tareas?estado=PENDIENTE&limit=5', { cache: 'no-store' }),
          fetch('/api/vendedor/leads?limit=5', { cache: 'no-store' }),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (tareasRes.ok) {
          const d = await tareasRes.json();
          setTareasRecientes(d.tareas || []);
        }
        if (leadsRes.ok) {
          const d = await leadsRes.json();
          setLeadsRecientes(d.leads || []);
        }
      } catch {
        toast.error('Error al cargar dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          👋 Hola, {session?.user?.name}
        </h1>
        <p className="text-muted-foreground">
          {session?.user?.empresaNombre || 'Sin empresa'} · {session?.user?.role}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Tareas pendientes" value={stats.tareasPendientes} emoji="📋" color="red" />
        <StatCard title="Tareas completadas" value={stats.tareasCompletadas} emoji="✅" color="green" />
        <StatCard title="Leads asignados" value={stats.leadsTotal} emoji="👥" color="blue" />
        <StatCard title="Leads atendidos" value={stats.leadsAtendidos} emoji="⭐" color="purple" />
      </div>

      {/* Tareas recientes + Leads recientes */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Tareas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>📋 Últimas tareas pendientes</span>
              <Link href="/vendedor/tareas" className="flex items-center gap-1 text-sm text-primary hover:underline">
                Ver todas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tareasRecientes.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">🎉 No tenés tareas pendientes</p>
            ) : (
              <div className="space-y-2">
                {tareasRecientes.map((t) => (
                  <Link key={t.id} href="/vendedor/tareas" className="flex items-center justify-between rounded-lg bg-muted/30 p-3 transition hover:bg-muted/50">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{t.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        📅 {t.fechaLimite ? new Date(t.fechaLimite).toLocaleDateString('es-AR') : 'Sin fecha'}
                      </p>
                    </div>
                    {t.prioridad && (
                      <Badge variant="secondary" className={`ml-2 ${PRIORIDAD_COLOR[t.prioridad] || ''}`}>
                        {t.prioridad}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>👥 Últimos leads asignados</span>
              <Link href="/vendedor/leads" className="flex items-center gap-1 text-sm text-primary hover:underline">
                Ver todos <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leadsRecientes.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">No tenés leads asignados</p>
            ) : (
              <div className="space-y-2">
                {leadsRecientes.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">📱 {lead.primaryPhone || lead.primaryEmail || '—'}</p>
                    </div>
                    {lead.primaryPhone && (
                      <a
                        href={`https://wa.me/${lead.primaryPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 rounded-lg bg-green-500 px-3 py-1 text-sm text-white transition hover:bg-green-600"
                      >
                        💬
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
