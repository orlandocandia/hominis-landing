// Productor dashboard — landing page of the productor panel (Fase 1 placeholder).
// PRODUCTOR = vendedor con permisos extendidos (ver equipo, reasignar).
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, MapPin, ShieldCheck } from 'lucide-react';

export default async function ProductorDashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel de Productor</h1>
          <p className="text-sm text-muted-foreground">
            Bienvenida/o, <span className="font-medium text-foreground">{session?.user?.name}</span>.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit gap-1">
          <ShieldCheck className="h-3 w-3" />
          Rol: PRODUCTOR
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Mis contactos" value="—" icon={<FileText className="h-5 w-5" />} hint="Próximamente" />
        <StatCard title="Equipo" value="—" icon={<Users className="h-5 w-5" />} hint="Próximamente" />
        <StatCard title="Mapa de zona" value="—" icon={<MapPin className="h-5 w-5" />} hint="Próximamente" />
        <StatCard title="Reasignaciones" value="—" icon={<ShieldCheck className="h-5 w-5" />} hint="Próximamente" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permisos extendidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>✅ Rol <strong>PRODUCTOR</strong>: vendedor con permisos extendidos.</p>
          <p>✅ Ver equipo de vendedores.</p>
          <p>✅ Reasignar contactos entre vendedores.</p>
          <p>✅ Acceso completo al panel de vendedor (<code>/vendedor</code>).</p>
          <p className="pt-2 border-t">⬜ Gestión de equipo — pendiente (Fase 2).</p>
          <p>⬜ Reasignación de contactos — pendiente (Fase 3).</p>
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
