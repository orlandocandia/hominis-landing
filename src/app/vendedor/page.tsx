// Vendedor dashboard — real stats from DB
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getTursoClient } from '@/lib/turso-config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Phone, Clock, CheckCircle2, TrendingUp, MapPin } from 'lucide-react';
import { LeadScoreBadge } from '@/components/lead-score-badge';
import { UpcomingReminders } from '@/components/upcoming-reminders';
import { GamificationWidget } from '@/components/gamification-widget';
import { TareasWidget } from '@/components/tareas-widget';
import { DashboardTitle } from '@/components/dashboard-i18n';
import { StatCard } from '@/components/ui/stat-card';
import Link from 'next/link';

export default async function VendedorDashboardPage() {
  const session = await getServerSession(authOptions);
  const isVendedor = session?.user?.role === 'VENDEDOR';
  const libsql = getTursoClient();
  const userId = session!.user.id;
  const empresaId = session.user.empresaId || null;

  // Stats: my contacts by status
  const [totalRes, newRes, attendedRes, recentRes] = await Promise.all([
    libsql.execute({ sql: empresaId ? 'SELECT COUNT(*) as n FROM Contact WHERE ownerId = ? AND empresaId = ?' : 'SELECT COUNT(*) as n FROM Contact WHERE ownerId = ?', args: empresaId ? [userId, empresaId] : [userId] }),
    libsql.execute({ sql: empresaId ? "SELECT COUNT(*) as n FROM Contact WHERE ownerId = ? AND status = 'NUEVO' AND empresaId = ?" : "SELECT COUNT(*) as n FROM Contact WHERE ownerId = ? AND status = 'NUEVO'", args: empresaId ? [userId, empresaId] : [userId] }),
    libsql.execute({ sql: empresaId ? "SELECT COUNT(*) as n FROM Contact WHERE ownerId = ? AND status = 'ATENDIDO' AND empresaId = ?" : "SELECT COUNT(*) as n FROM Contact WHERE ownerId = ? AND status = 'ATENDIDO'", args: empresaId ? [userId, empresaId] : [userId] }),
    libsql.execute({
      sql: empresaId
        ? `SELECT c.id, c.name, c.address, c.city, c.status, c.createdAt, c.latitude, c.longitude, c.leadScore, c.leadPriority FROM Contact c WHERE c.ownerId = ? AND c.empresaId = ? ORDER BY c.createdAt DESC LIMIT 5`
        : `SELECT c.id, c.name, c.address, c.city, c.status, c.createdAt, c.latitude, c.longitude, c.leadScore, c.leadPriority FROM Contact c WHERE c.ownerId = ? ORDER BY c.createdAt DESC LIMIT 5`,
      args: empresaId ? [userId, empresaId] : [userId],
    }),
  ]);

  const num = (r: any) => Number(r.rows[0]?.n || 0);
  const total = num(totalRes);
  const nuevos = num(newRes);
  const attended = num(attendedRes);
  const conversion = total > 0 ? Number(((attended / total) * 100).toFixed(2)) : 0;
  const recent = recentRes.rows as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <DashboardTitle role="VENDEDOR" name={session?.user?.name} />
        <Badge variant="secondary" className="w-fit gap-1">
          <CheckCircle2 className="h-3 w-3" /> Rol: {session?.user?.role}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Mis contactos" value={total} icon={FileText} color="blue" />
        <StatCard title="Nuevos" value={nuevos} icon={Phone} color="red" hint="sin atender" />
        <StatCard title="Atendidos" value={attended} icon={CheckCircle2} color="green" />
        <StatCard title="Conversión" value={`${conversion}%`} icon={TrendingUp} color="purple" />
      </div>

      {/* Quick actions + gamification */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/vendedor/contactos/nuevo" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Nuevo contacto</p>
                <p className="text-sm text-muted-foreground">Crear y asignar automáticamente</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/vendedor/contactos" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Mi cartera ({total})</p>
                <p className="text-sm text-muted-foreground">Ver todos mis contactos</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <GamificationWidget />
      </div>

      {/* Upcoming reminders + follow-ups */}
      <UpcomingReminders />

      {/* Tasks */}
      <TareasWidget />

      {/* Recent contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contactos recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No tenés contactos asignados todavía.</p>
              <Link href="/vendedor/contactos/nuevo" className="text-primary hover:underline text-sm mt-2 inline-block">
                Crear el primer contacto
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((c) => (
                <Link key={c.id} href={`/vendedor/contactos/${c.id}`} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.address}{c.city ? `, ${c.city}` : ''}</p>
                      <div className="mt-1"><LeadScoreBadge score={c.leadScore} priority={c.leadPriority} size="sm" /></div>
                    </div>
                  </div>
                  <Badge variant={c.status === 'NUEVO' ? 'default' : c.status === 'ATENDIDO' ? 'secondary' : 'outline'} className="text-[10px]">
                    {c.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}




