'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { StatCard } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function VendedorDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    tareasPendientes: 0,
    tareasCompletadas: 0,
    leadsAsignados: 0,
    leadsAtendidos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/vendedor/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats({
          tareasPendientes: data.tareasPendientes || 0,
          tareasCompletadas: data.tareasCompletadas || 0,
          leadsAsignados: data.leadsAsignados || data.leadsTotal || 0,
          leadsAtendidos: data.leadsAtendidos || 0,
        });
        setLoading(false);
      })
      .catch((e) => {
        console.error('Error fetching stats:', e);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mi Panel</h1>
        <p className="text-muted-foreground">
          Bienvenida/o, {session?.user?.name} · {session?.user?.empresaNombre || 'Sin empresa'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Tareas pendientes" value={stats.tareasPendientes} emoji="📋" color="red" />
        <StatCard title="Tareas completadas" value={stats.tareasCompletadas} emoji="✅" color="green" />
        <StatCard title="Leads asignados" value={stats.leadsAsignados} emoji="👥" color="blue" />
        <StatCard title="Leads atendidos" value={stats.leadsAtendidos} emoji="⭐" color="purple" />
      </div>
    </div>
  );
}
