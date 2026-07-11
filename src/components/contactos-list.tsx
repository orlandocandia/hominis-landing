'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, MapPin, Phone, Mail, Loader2, FileText, ArrowDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LeadScoreBadge } from '@/components/lead-score-badge';

interface Contact {
  id: string;
  name: string;
  primaryEmail: string | null;
  primaryPhone: string | null;
  address: string;
  city: string | null;
  status: string;
  segment: string | null;
  createdAt: string;
  ownerNombre: string | null;
  ownerApellido: string | null;
  leadScore: number | null;
  leadPriority: string | null;
}

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  NUEVO: 'default',
  LEIDO: 'secondary',
  ATENDIDO: 'secondary',
  RECHAZADO: 'destructive',
};

export function ContactosList({ newLinkBase = '/vendedor/contactos', detailLinkBase = '/vendedor/contactos' }: { newLinkBase?: string; detailLinkBase?: string }) {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortByScore, setSortByScore] = useState(false);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (sortByScore) { params.set('sortBy', 'leadScore'); params.set('order', 'desc'); }
      const res = await fetch(`/api/crm/contacts?${params}`);
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch {
      toast.error('Error al cargar contactos');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortByScore]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contactos</h1>
          <p className="text-sm text-muted-foreground">{contacts.length} {contacts.length === 1 ? 'contacto' : 'contactos'}</p>
        </div>
        <Button onClick={() => router.push(`${newLinkBase}/nuevo`)} className="gap-2">
          <Plus className="w-4 h-4" /> Nuevo contacto
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, email, teléfono..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant={sortByScore ? 'default' : 'outline'} onClick={() => setSortByScore(!sortByScore)} className="gap-1.5" title="Ordenar por score de lead">
            <ArrowDownUp className="w-3.5 h-3.5" /> Score
          </Button>
          {['', 'NUEVO', 'LEIDO', 'ATENDIDO', 'RECHAZADO'].map((s) => (
            <Button key={s || 'ALL'} size="sm" variant={statusFilter === s ? 'default' : 'outline'} onClick={() => setStatusFilter(s)}>
              {s || 'Todos'}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : contacts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay contactos {search || statusFilter ? 'con esos filtros' : 'todavía'}.</p>
            {!search && !statusFilter && (
              <Button onClick={() => router.push(`${newLinkBase}/nuevo`)} className="mt-4 gap-2">
                <Plus className="w-4 h-4" /> Crear el primer contacto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {contacts.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{c.name}</span>
                      <Badge variant={STATUS_COLORS[c.status] || 'outline'} className="text-[10px] py-0">{c.status}</Badge>
                      {c.segment && <Badge variant="outline" className="text-[10px] py-0">{c.segment.replace('_', ' ')}</Badge>}
                      <LeadScoreBadge score={c.leadScore} priority={c.leadPriority} size="sm" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.address}{c.city ? `, ${c.city}` : ''}</span>
                      {c.primaryPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.primaryPhone}</span>}
                      {c.primaryEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.primaryEmail}</span>}
                    </div>
                    {c.ownerNombre && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5">Asignado a: {c.ownerNombre} {c.ownerApellido || ''}</p>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="ghost" asChild className="flex-shrink-0">
                  <Link href={`${detailLinkBase}/${c.id}`}>Ver</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
