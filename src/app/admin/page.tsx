// Admin dashboard — real stats from DB
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getTursoClient } from '@/lib/turso-config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, FileText, ShieldCheck, Activity, MapPin, TrendingUp, Mail } from 'lucide-react';
import { DashboardTitle } from '@/components/dashboard-i18n';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const libsql = getTursoClient();

  // Run stats queries in parallel
  const [vendorsRes, vendedoresRes, productoresRes, contactsRes, newContactsRes, attendedRes, leadsRes, geoRes, topRes, recentContactsRes] = await Promise.all([
    libsql.execute(`SELECT COUNT(*) as n FROM "User" WHERE rol IN ('VENDEDOR','PRODUCTOR') AND activo = 1`),
    libsql.execute(`SELECT COUNT(*) as n FROM "User" WHERE rol = 'VENDEDOR' AND activo = 1`),
    libsql.execute(`SELECT COUNT(*) as n FROM "User" WHERE rol = 'PRODUCTOR' AND activo = 1`),
    libsql.execute(`SELECT COUNT(*) as n FROM Contact`),
    libsql.execute(`SELECT COUNT(*) as n FROM Contact WHERE status = 'NUEVO'`),
    libsql.execute(`SELECT COUNT(*) as n FROM Contact WHERE status = 'ATENDIDO'`),
    libsql.execute(`SELECT COUNT(*) as n FROM Contacto WHERE estado = 'NUEVO'`),
    libsql.execute(`SELECT COUNT(*) as n FROM "User" WHERE rol IN ('VENDEDOR','PRODUCTOR') AND activo = 1 AND latitude IS NOT NULL`),
    libsql.execute({
      sql: `SELECT u.id, u.nombre, u.apellido, u.email, u.totalContacts, u.conversionRate, u.city
        FROM "User" u WHERE u.rol IN ('VENDEDOR','PRODUCTOR') AND u.activo = 1
        ORDER BY u.totalContacts DESC LIMIT 5`,
    }),
    libsql.execute({
      sql: `SELECT id, name, primaryEmail, primaryPhone, status, message, segment, createdAt
        FROM Contact ORDER BY createdAt DESC LIMIT 8`,
    }),
  ]);

  const num = (r: any) => Number(r.rows[0]?.n || 0);
  const activeVendors = num(vendorsRes);
  const totalVendedores = num(vendedoresRes);
  const totalProductores = num(productoresRes);
  const totalContacts = num(contactsRes);
  const newContacts = num(newContactsRes);
  const attendedContacts = num(attendedRes);
  const newLeads = num(leadsRes);
  const geoVendors = num(geoRes);
  const conversionRate = totalContacts > 0 ? Number(((attendedContacts / totalContacts) * 100).toFixed(2)) : 0;
  const topVendors = topRes.rows as any[];
  const recentContacts = recentContactsRes.rows as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <DashboardTitle role="ADMIN" name={session?.user?.name} />
        <Badge variant="secondary" className="w-fit gap-1">
          <ShieldCheck className="h-3 w-3" /> Rol: ADMIN
        </Badge>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Vendedores activos" value={activeVendors.toString()} icon={<Users className="h-5 w-5" />} hint={`${totalVendedores} vendedores + ${totalProductores} productores`} />
        <StatCard title="Contactos CRM" value={totalContacts.toString()} icon={<FileText className="h-5 w-5" />} hint={`${newContacts} nuevos`} />
        <StatCard title="Leads sin atender" value={newLeads.toString()} icon={<Mail className="h-5 w-5" />} hint="de la landing" />
        <StatCard title="Conversión" value={`${conversionRate}%`} icon={<TrendingUp className="h-5 w-5" />} hint={`${attendedContacts} atendidos`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Quick actions */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Acciones rápidas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/vendedores/nuevo" className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors text-sm">
              <Users className="w-4 h-4 text-primary" /> Crear vendedor
            </Link>
            <Link href="/admin/vendedores" className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors text-sm">
              <FileText className="w-4 h-4 text-primary" /> Ver vendedores ({activeVendors})
            </Link>
            <Link href="/admin/perfil" className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors text-sm">
              <ShieldCheck className="w-4 h-4 text-primary" /> Mi perfil
            </Link>
          </CardContent>
        </Card>

        {/* Top vendors */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Top vendedores por contactos</CardTitle></CardHeader>
          <CardContent>
            {topVendors.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No hay vendedores con contactos asignados todavía.</p>
            ) : (
              <div className="space-y-2">
                {topVendors.map((v, i) => (
                  <div key={v.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{v.nombre} {v.apellido || ''}</p>
                        <p className="text-xs text-muted-foreground">{v.email} · {v.city || 'sin ciudad'}</p>
                      </div>
                    </div>
                    <div className="text-right">
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

      {/* Geolocation status */}
      <Card>
        <CardHeader><CardTitle className="text-base">Estado de geolocalización</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <p className="text-sm">
              <span className="font-bold">{geoVendors}</span> de {activeVendors} vendedores tienen ubicación geográfica cargada
              ({activeVendors > 0 ? Math.round((geoVendors / activeVendors) * 100) : 0}%).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent leads / messages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>📩 Últimos mensajes</span>
            <Link href="/admin/contactos" className="text-sm text-primary hover:underline">Ver todos →</Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay mensajes aún. Los leads aparecerán aquí cuando alguien complete el formulario.
            </p>
          ) : (
            <div className="space-y-3">
              {recentContacts.map((c: any) => (
                <div key={c.id} className="flex items-start justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{c.name}</span>
                      <Badge variant={c.status === 'NUEVO' ? 'default' : c.status === 'ATENDIDO' ? 'secondary' : 'outline'} className="text-[10px] py-0">
                        {c.status}
                      </Badge>
                      {c.segment && <Badge variant="outline" className="text-[10px] py-0">{c.segment.replace('_', ' ')}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      {c.primaryPhone && <span>📱 {c.primaryPhone}</span>}
                      {c.primaryEmail && <span>📧 {c.primaryEmail}</span>}
                    </div>
                    {c.message && (
                      <p className="text-xs text-muted-foreground mt-1 bg-muted/50 px-2 py-1 rounded">💬 {c.message.substring(0, 120)}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {new Date(c.createdAt as string).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0 ml-2">
                    <Link href={`/admin/contactos`} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition">Ver</Link>
                    {c.primaryPhone && (
                      <a href={`https://wa.me/${c.primaryPhone.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded hover:bg-green-500/20 transition">WhatsApp</a>
                    )}
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
