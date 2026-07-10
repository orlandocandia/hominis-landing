// Admin dashboard — landing page of the admin panel.
// This is a starter page for the CRM; extend with real widgets as you build it.
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, ShieldCheck, Activity } from 'lucide-react';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-sm text-muted-foreground">
            Bienvenida, <span className="font-medium text-foreground">{session?.user?.name}</span>.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit gap-1">
          <ShieldCheck className="h-3 w-3" />
          Rol: ADMIN
        </Badge>
      </div>

      {/* Stat cards (placeholders for the CRM) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Contactos totales" value="—" icon={<FileText className="h-5 w-5" />} hint="Próximamente" />
        <StatCard title="Nuevos hoy" value="—" icon={<Activity className="h-5 w-5" />} hint="Próximamente" />
        <StatCard title="Usuarios activos" value="—" icon={<Users className="h-5 w-5" />} hint="Próximamente" />
        <StatCard title="Pendientes" value="—" icon={<ShieldCheck className="h-5 w-5" />} hint="Próximamente" />
      </div>

      {/* Getting started */}
      <Card>
        <CardHeader>
          <CardTitle>Próximos pasos del CRM</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>✅ Autenticación con roles (ADMIN / ASESOR) — implementada.</p>
          <p>⬜ Gestión de usuarios (crear/editar asesores) — pendiente.</p>
          <p>⬜ Listado de contactos con filtros — pendiente.</p>
          <p>⬜ Reportes y métricas — pendiente.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  hint,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground/70">{hint}</p>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
