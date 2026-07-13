'use client';

// /vendedor/leads — Lista paginada de leads asignados al vendedor.
// Multiempresa: el backend filtra por session.user.empresaId automáticamente.
import { useState, useEffect, useCallback } from 'react';
import {
  Users, MessageCircle, ChevronLeft, ChevronRight, Search, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Lead {
  id: string;
  name: string;
  primaryEmail: string | null;
  primaryPhone: string | null;
  address: string | null;
  city: string | null;
  status: string;
  leadScore: number | null;
  leadPriority: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ALL = '__all__';
const STATUS_OPTIONS = [
  { value: ALL, label: 'Todos' },
  { value: 'NUEVO', label: 'Nuevo' },
  { value: 'LEIDO', label: 'Leído' },
  { value: 'EN_CONTACTO', label: 'En contacto' },
  { value: 'REUNION', label: 'Reunión' },
  { value: 'PRESUPUESTO', label: 'Presupuesto' },
  { value: 'ATENDIDO', label: 'Atendido' },
];

const STATUS_COLOR: Record<string, string> = {
  NUEVO: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  LEIDO: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  EN_CONTACTO: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  REUNION: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  PRESUPUESTO: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400',
  ATENDIDO: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  RECHAZADO: 'bg-zinc-500/15 text-zinc-500',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  } catch {
    return '—';
  }
}

export default function VendedorLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(ALL);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (status !== ALL) params.set('status', status);
      if (search) params.set('search', search);
      const res = await fetch(`/api/vendedor/leads?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeads(data.leads ?? []);
      setPagination(data.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 });
    } catch {
      toast.error('Error al cargar leads');
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const whatsappUrl = (phone: string | null) => {
    if (!phone) return null;
    const digits = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/${digits}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </span>
          Mis Leads
        </h1>
        <p className="text-sm text-muted-foreground">
          {pagination.total} lead{pagination.total !== 1 ? 's' : ''} asignado{pagination.total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <Select value={status} onValueChange={(v) => { setPage(1); setStatus(v); }}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : leads.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Users className="h-10 w-10 opacity-50" />
            <p>No tenés leads asignados con estos filtros.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {leads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold truncate">{lead.name}</h3>
                    <Badge variant="secondary" className={STATUS_COLOR[lead.status] || ''}>
                      {lead.status.replace('_', ' ')}
                    </Badge>
                    {lead.leadScore != null && lead.leadScore > 0 && (
                      <Badge variant="outline" className="text-[10px]">
                        ⭐ {lead.leadScore}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    {lead.primaryPhone && <span>📞 {lead.primaryPhone}</span>}
                    {lead.primaryEmail && <span className="truncate">✉️ {lead.primaryEmail}</span>}
                    {lead.address && <span className="truncate">📍 {lead.address}</span>}
                    <span>📅 {formatDate(lead.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {whatsappUrl(lead.primaryPhone) && (
                    <Button size="sm" variant="outline" asChild title="WhatsApp">
                      <a href={whatsappUrl(lead.primaryPhone)!} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Página {page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages || loading}
            onClick={() => setPage(page + 1)}
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
