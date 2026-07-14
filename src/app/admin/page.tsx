'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { StatCard } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalLeads: 0,
    nuevos: 0,
    atendidos: 0,
    conversion: 0,
    vendedores: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then((r) => r.json()),
      fetch('/api/admin/stats/equipo').then((r) => r.json()),
    ])
      .then(([statsData, equipoData]) => {
        const totalLeads = statsData.totalLeads || 0;
        const atendidos = statsData.atendidos || 0;
        setStats({
          totalLeads,
          nuevos: statsData.nuevos || 0,
          atendidos,
          conversion: totalLeads > 0 ? Math.round((atendidos / totalLeads) * 100) : 0,
          vendedores: equipoData.totalVendedores || 0,
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
        <p className="text-muted-foreground">Bienvenida/o, {session?.user?.name}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Leads" value={stats.totalLeads} emoji="📋" color="blue" />
        <StatCard title="Nuevos" value={stats.nuevos} emoji="🆕" color="red" />
        <StatCard title="Atendidos" value={stats.atendidos} emoji="✅" color="green" />
        <StatCard title="Conversión" value={`${stats.conversion}%`} emoji="📈" color="purple" />
        <StatCard title="Vendedores" value={stats.vendedores} emoji="👥" color="yellow" />
      </div>
    </div>
  );
}
