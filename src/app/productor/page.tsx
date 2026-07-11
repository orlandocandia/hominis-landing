// Productor dashboard — real team stats + team map
// PRODUCTOR = vendedor extendido: sees all team contacts + all vendors
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getTursoClient } from '@/lib/turso-config';
import { VendedoresMapClient } from '@/components/dashboard/vendedores-map-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, TrendingUp, ShieldCheck, MapPin } from 'lucide-react';
import Link from 'next/link';

export default async function ProductorDashboardPage() {
  const session = await getServerSession(authOptions);
  const libsql = getTursoClient();

  // Team stats (all vendors + productores)
  const [vendorsRes, myContactsRes, teamContactsRes, attendedRes, geoVendorsRes, teamRes] = await Promise.all([
    libsql.execute(`SELECT COUNT(*) as n FROM "User" WHERE rol IN ('VENDEDOR','PRODUCTOR') AND activo = 1`),
    libsql.execute({ sql: 'SELECT COUNT(*) as n FROM Contact WHERE ownerId = ?', args: [session!.user.id] }),
    libsql.execute(`SELECT COUNT(*) as n FROM Contact`),
    libsql.execute(`SELECT COUNT(*) as n FROM Contact WHERE status = 'ATENDIDO'`),
    libsql.execute(`SELECT COUNT(*) as n FROM "User" WHERE rol IN ('VENDEDOR','PRODUCTOR') AND activo = 1 AND latitude IS NOT NULL`),
    libsql.execute({
      sql: `SELECT u.id, u.nombre, u.apellido, u.email, u.rol, u.city, u.totalContacts, u.conversionRate
        FROM "User" u WHERE u.rol IN ('VENDEDOR','PRODUCTOR') AND u.activo = 1
        ORDER BY u.totalContacts DESC`,
    }),
  ]);

  const num = (r: any) => Number(r.rows[0]?.n || 0);
  const totalVendors = num(vendorsRes);
  const myContacts = num(myContactsRes);
  const teamContacts = num(teamContactsRes);
  const attended = num(attendedRes);
  const geoVendors = num(geoVendorsRes);
  const teamConversion = teamContacts > 0 ? Number(((attended / teamContacts) * 100).toFixed(2)) : 0;
  const team = teamRes.rows as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel de Productor</h1>
          <p className="text-sm text-muted-foreground">
            Bienvenida/o, <span className="font-medium text-foreground">{session?.user?.name}</span>. Vista de equipo.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit gap-1">
          <ShieldCheck className="h-3 w-3" /> Rol: PRODUCTOR
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Vendedores activos" value={totalVendors.toString()} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Mis contactos" value={myContacts.toString()} icon={<FileText className="h-5 w-5" />} hint="mi cartera personal" />
        <StatCard title="Contactos del equipo" value={teamContacts.toString()} icon={<FileText className="h-5 w-5" />} hint="todos los vendedores" />
        <StatCard title="Conversión equipo" value={`${teamConversion}%`} icon={<TrendingUp className="h-5 w-5" />} hint={`${attended} atendidos`} />
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/vendedor" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex items-center gap-3 p-4">
              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
              <div><p className="text-sm font-medium">Mi cartera</p><p className="text-xs text-muted-foreground">{myContacts} contactos</p></div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/productor/contactos" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="w-5 h-5 text-primary flex-shrink-0" />
              <div><p className="text-sm font-medium">Contactos del equipo</p><p className="text-xs text-muted-foreground">ver todos</p></div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/productor/mapa" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex items-center gap-3 p-4">
              <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
              <div><p className="text-sm font-medium">Mapa del equipo</p><p className="text-xs text-muted-foreground">{geoVendors} vendedores geo</p></div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/productor/perfil" className="block">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex items-center gap-3 p-4">
              <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
              <div><p className="text-sm font-medium">Mi perfil</p><p className="text-xs text-muted-foreground">multicanal</p></div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Team map */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mapa del equipo</CardTitle>
        </CardHeader>
        <CardContent>
          <VendedoresMapClient contactLinkBase="/productor/contactos" />
        </CardContent>
      </Card>

      {/* Team list */}
      <Card>
        <CardHeader><CardTitle className="text-base">Equipo ({team.length})</CardTitle></CardHeader>
        <CardContent>
          {team.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No hay vendedores en el equipo.</p>
          ) : (
            <div className="space-y-2">
              {team.map((v, i) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary flex-shrink-0">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium truncate">{v.nombre} {v.apellido || ''}</span>
                        <Badge variant={v.rol === 'PRODUCTOR' ? 'default' : 'secondary'} className="text-[10px] py-0">{v.rol}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{v.email} · {v.city || 'sin ciudad'}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold">{v.totalContacts}</p>
                    <p className="text-xs text-muted-foreground">{v.conversionRate}% conv.</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, hint }: { title: string; value: string; icon: React.ReactNode; hint?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground/70">{hint}</p>}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      </CardContent>
    </Card>
  );
}
