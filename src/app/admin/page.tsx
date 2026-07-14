'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardTitle } from '@/components/dashboard-i18n';
import { ShieldCheck, FileText, Users, TrendingUp, Mail, Phone, Clock, CheckCircle2, ListTodo } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [contacts, setContacts] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalLeads: 0, totalVendedores: 0, totalTareas: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [contactsRes, statsRes] = await Promise.all([
          fetch('/api/crm/contacts?limit=50'),
          fetch('/api/admin/stats/equipo'),
        ]);
        if (!contactsRes.ok) throw new Error(`HTTP ${contactsRes.status}`);
        const contactsData = await contactsRes.json();
        setContacts(contactsData.contacts || []);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            totalLeads: statsData.totalLeads || 0,
            totalVendedores: statsData.totalVendedores || 0,
            totalTareas: statsData.totalTareas || 0,
          });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const nuevos = contacts.filter(c => c.status === 'NUEVO').length;
  const atendidos = contacts.filter(c => c.status === 'ATENDIDO').length;
  const conversionRate = stats.totalLeads > 0 ? Math.round((atendidos / stats.totalLeads) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <DashboardTitle role="ADMIN" name={session?.user?.name} />
        <Badge variant="secondary" className="w-fit gap-1">
          <ShieldCheck className="h-3 w-3" /> ADMIN
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard title="Total Leads" value={stats.totalLeads} icon={FileText} color="blue" />
        <StatCard title="Nuevos" value={nuevos} icon={Clock} color="red" hint="sin atender" />
        <StatCard title="Atendidos" value={atendidos} icon={CheckCircle2} color="green" />
        <StatCard title="Conversión" value={`${conversionRate}%`} icon={TrendingUp} color="purple" />
        <StatCard title="Vendedores" value={stats.totalVendedores} icon={Users} color="yellow" />
      </div>

      {/* Messages from form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>📩 Mensajes del formulario</span>
            <Link href="/admin/leads" className="text-sm text-primary hover:underline">Ver todos →</Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay mensajes aún. Los leads aparecerán aquí cuando alguien complete el formulario.
            </p>
          ) : (
            <div className="space-y-3">
              {contacts.slice(0, 10).map((contact) => (
                <div key={contact.id} className="flex items-start justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{contact.name}</span>
                      <Badge variant={contact.status === 'NUEVO' ? 'default' : contact.status === 'ATENDIDO' ? 'secondary' : 'outline'} className="text-[10px] py-0">
                        {contact.status || 'NUEVO'}
                      </Badge>
                      {contact.segment && <Badge variant="outline" className="text-[10px] py-0">{contact.segment.replace('_', ' ')}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      {contact.primaryPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{contact.primaryPhone}</span>}
                      {contact.primaryEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{contact.primaryEmail}</span>}
                    </div>
                    {contact.message && (
                      <p className="text-xs text-muted-foreground mt-1 bg-muted/50 px-2 py-1 rounded">💬 {contact.message.substring(0, 150)}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {new Date(contact.createdAt).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0 ml-2">
                    {contact.primaryPhone && (
                      <a href={`https://wa.me/${contact.primaryPhone.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded hover:bg-green-500/20 transition flex items-center gap-1">
                        💬 WhatsApp
                      </a>
                    )}
                    <Link href={`/admin/leads/${contact.id}`} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition text-center">
                      Ver
                    </Link>
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


