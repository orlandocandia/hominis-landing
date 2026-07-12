'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardTitle } from '@/components/dashboard-i18n';
import { ShieldCheck, FileText, Users, TrendingUp, Mail, Phone, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch('/api/crm/contacts?limit=50');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setContacts(data.contacts || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  }, []);

  const totalLeads = contacts.length;
  const nuevos = contacts.filter(c => c.status === 'NUEVO').length;
  const atendidos = contacts.filter(c => c.status === 'ATENDIDO').length;
  const conversionRate = totalLeads > 0 ? Math.round((atendidos / totalLeads) * 100) : 0;

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
              <p className="mt-1 text-2xl font-bold">{totalLeads}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nuevos</p>
              <p className="mt-1 text-2xl font-bold">{nuevos}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Atendidos</p>
              <p className="mt-1 text-2xl font-bold">{atendidos}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversión</p>
              <p className="mt-1 text-2xl font-bold">{conversionRate}%</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages from form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>📩 Mensajes del formulario</span>
            <Link href="/admin/contactos" className="text-sm text-primary hover:underline">Ver todos →</Link>
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
                    <Link href={`/admin/contactos/${contact.id}`} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition text-center">
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
