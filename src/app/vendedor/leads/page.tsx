'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, ChevronLeft, ChevronRight, Loader2, MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = { NUEVO: 'bg-sky-500/15 text-sky-600 dark:text-sky-400', LEIDO: 'bg-violet-500/15 text-violet-600 dark:text-violet-400', EN_CONTACTO: 'bg-amber-500/15 text-amber-600 dark:text-amber-400', REUNION: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400', PRESUPUESTO: 'bg-orange-500/15 text-orange-600 dark:text-orange-400', ATENDIDO: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400', RECHAZADO: 'bg-zinc-500/15 text-zinc-500' };
const STATUS_OPTIONS = [{ value: 'NUEVO', label: '🆕 Nuevo' }, { value: 'LEIDO', label: '📖 Leído' }, { value: 'EN_CONTACTO', label: '💬 En contacto' }, { value: 'REUNION', label: '🤝 Reunión' }, { value: 'PRESUPUESTO', label: '💰 Presupuesto' }, { value: 'ATENDIDO', label: '✅ Atendido' }, { value: 'RECHAZADO', label: '❌ Rechazado' }];

function formatDate(iso: string): string { try { return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return '—'; } }

export default function VendedorLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ status: '', search: '' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: 10 });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pagination.page), limit: String(pagination.limit) });
      if (filtros.status) params.set('status', filtros.status);
      if (filtros.search) params.set('search', filtros.search);
      const res = await fetch(`/api/vendedor/leads?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeads(data.leads || []);
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 1, limit: 10 });
    } catch { toast.error('Error al cargar leads'); } finally { setLoading(false); }
  }, [pagination.page, filtros]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleChangeStatus = async (id: string, status: string) => {
    try { await fetch(`/api/vendedor/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); toast.success('Estado actualizado'); fetchLeads(); } catch { toast.error('Error al cambiar estado'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Users className="h-5 w-5 text-primary" /></span> Mis Leads</h1><p className="text-sm text-muted-foreground">{pagination.total} leads asignados</p></div>
        <Button variant="outline" onClick={fetchLeads} className="gap-2"><RefreshCw className="h-4 w-4" /> Actualizar</Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar por nombre, email o teléfono..." value={filtros.search} onChange={(e) => setFiltros({ ...filtros, search: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && fetchLeads()} className="pl-9" /></div>
        <select value={filtros.status} onChange={(e) => setFiltros({ ...filtros, status: e.target.value })} className="rounded-lg border border-input bg-background px-4 py-2 text-sm"><option value="">Todos los estados</option>{STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
      </div>
      {loading ? (<div className="space-y-2">{[0,1,2,3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}</div>) : leads.length === 0 ? (<Card className="border-dashed"><CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground"><MessageCircle className="h-10 w-10 opacity-50" /><p>No tienes leads asignados</p></CardContent></Card>) : (
        <div className="space-y-2">
          {leads.map((lead) => (
            <Card key={lead.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{lead.name}</h3><Badge variant="secondary" className={STATUS_COLORS[lead.status] || ''}>{lead.status?.replace('_',' ')}</Badge></div>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">{lead.primaryPhone && <span>📱 {lead.primaryPhone}</span>}{lead.primaryEmail && <span className="truncate">📧 {lead.primaryEmail}</span>}</div>
                  {lead.message && <p className="mt-2 line-clamp-2 rounded-lg bg-muted/30 p-2 text-sm">💬 {lead.message}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">📅 {formatDate(lead.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {lead.primaryPhone && (<a href={`https://wa.me/${lead.primaryPhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg bg-green-500 px-3 py-1.5 text-sm text-white hover:bg-green-600"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>)}
                  {lead.status !== 'ATENDIDO' && lead.status !== 'RECHAZADO' && (<select value={lead.status} onChange={(e) => handleChangeStatus(lead.id, e.target.value)} className="rounded-lg border border-input bg-background px-2 py-1.5 text-sm">{STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {pagination.totalPages > 1 && (<div className="flex items-center justify-between gap-4 border-t border-border pt-4"><div className="text-sm text-muted-foreground">Mostrando {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}</div><div className="flex items-center gap-2"><Button variant="outline" size="icon" disabled={pagination.page === 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}><ChevronLeft className="h-4 w-4" /></Button><span className="rounded-lg bg-primary/10 px-3 py-1 text-sm">{pagination.page} / {pagination.totalPages}</span><Button variant="outline" size="icon" disabled={pagination.page === pagination.totalPages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}><ChevronRight className="h-4 w-4" /></Button></div></div>)}
    </div>
  );
}
