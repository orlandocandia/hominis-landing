'use client';

// /admin/leads — Gestión completa de mensajes (leads) con paginación, filtros, acciones masivas.
import { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, ChevronLeft, ChevronRight, Loader2,
  MessageCircle, Check, Trash2, Download, Printer, ChevronDown, ChevronUp, Filter, X,
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
  NUEVO: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  LEIDO: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  ATENDIDO: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  RECHAZADO: 'bg-gray-100 text-gray-700 dark:bg-gray-800',
};

const STATUS_LABELS: Record<string, string> = {
  NUEVO: '🆕 Nuevo',
  LEIDO: '📖 Leído',
  ATENDIDO: '✅ Atendido',
  RECHAZADO: '❌ Rechazado',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-AR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return '—'; }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [filtros, setFiltros] = useState({
    status: '', search: '', fechaDesde: '', fechaHasta: '',
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: 15 });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });
      if (filtros.status) params.set('status', filtros.status);
      if (filtros.search) params.set('search', filtros.search);
      if (filtros.fechaDesde) params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params.set('fechaHasta', filtros.fechaHasta);

      const res = await fetch(`/api/admin/leads?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeads(data.leads || []);
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 1, limit: 15 });
    } catch {
      toast.error('Error al cargar leads');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filtros]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((l) => l.id));
    }
  };

  const handleSelectLead = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAction = async (id: string, action: string) => {
    try {
      await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      toast.success('Estado actualizado');
      fetchLeads();
    } catch {
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este lead permanentemente?')) return;
    try {
      await fetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
      toast.success('Lead eliminado');
      fetchLeads();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedLeads.length === 0) return;
    if (!confirm(`¿Aplicar "${action}" a ${selectedLeads.length} leads?`)) return;
    try {
      await fetch('/api/admin/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, leadIds: selectedLeads }),
      });
      toast.success(`Acción aplicada a ${selectedLeads.length} leads`);
      setSelectedLeads([]);
      fetchLeads();
    } catch {
      toast.error('Error en acción masiva');
    }
  };

  const handleLimpiarFiltros = () => {
    setFiltros({ status: '', search: '', fechaDesde: '', fechaHasta: '' });
  };

  const handleExport = (lead: any) => {
    const data = {
      nombre: lead.name, email: lead.email, telefono: lead.telefono,
      mensaje: lead.mensaje, estado: lead.status, segmento: lead.segmento, fecha: lead.createdAt,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lead_${lead.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = (lead: any) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html><head><title>Lead - ${lead.name}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px;">
          <h1>${lead.name}</h1>
          <p><strong>Email:</strong> ${lead.email}</p>
          <p><strong>Teléfono:</strong> ${lead.telefono}</p>
          <p><strong>Mensaje:</strong> ${lead.mensaje || 'Sin mensaje'}</p>
          <p><strong>Estado:</strong> ${lead.status}</p>
          <p><strong>Fecha:</strong> ${formatDate(lead.createdAt)}</p>
        </body></html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (loading && pagination.page === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">📋 Mensajes</h1>
          <p className="text-sm text-muted-foreground">{pagination.total} mensajes recibidos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-muted transition text-sm"
          >
            <Filter className="w-4 h-4" /> Filtros
            {Object.values(filtros).some((v) => v) && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
          <button
            onClick={() => window.open(`/api/admin/leads/export/excel?${new URLSearchParams({ ...(filtros.status && { status: filtros.status }), ...(filtros.search && { search: filtros.search }) })}`)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-500/20 transition text-sm"
          >
            📊 Excel
          </button>
          <button
            onClick={() => window.open(`/api/admin/leads/export/pdf?${new URLSearchParams({ ...(filtros.status && { status: filtros.status }), ...(filtros.search && { search: filtros.search }) })}`)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition text-sm"
          >
            📄 PDF
          </button>
          <button
            onClick={fetchLeads}
            className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-muted transition text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Estado</label>
              <select
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">Todos</option>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nombre, email o teléfono..."
                  value={filtros.search}
                  onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && fetchLeads()}
                  className="w-full pl-8 pr-4 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Fecha desde</label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Fecha hasta</label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={fetchLeads} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm">
              Aplicar
            </button>
            <button onClick={handleLimpiarFiltros} className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Acciones masivas */}
      {selectedLeads.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{selectedLeads.length} leads seleccionados</span>
            <button onClick={() => setSelectedLeads([])} className="p-1 hover:bg-muted rounded-lg transition">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleBulkAction('LEIDO')} className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-500/20 transition text-sm">
              <Check className="w-4 h-4" /> Marcar como leídos
            </button>
            <button onClick={() => handleBulkAction('ATENDIDO')} className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-500/20 transition text-sm">
              <Check className="w-4 h-4" /> Marcar como atendidos
            </button>
            <button onClick={() => handleBulkAction('DELETE')} className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition text-sm">
              <Trash2 className="w-4 h-4" /> Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selectedLeads.length === leads.length && leads.length > 0} onChange={handleSelectAll} className="rounded border-input" />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Cliente</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground hidden md:table-cell">Contacto</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground hidden lg:table-cell">Mensaje</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground hidden sm:table-cell">Estado</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground hidden xl:table-cell">Fecha</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    No hay mensajes con estos filtros.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    isSelected={selectedLeads.includes(lead.id)}
                    onSelect={() => handleSelectLead(lead.id)}
                    onAction={handleAction}
                    onDelete={handleDelete}
                    onExport={handleExport}
                    onPrint={handlePrint}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="p-2 border border-input rounded-lg hover:bg-muted transition disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm bg-primary/10 rounded-lg">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="p-2 border border-input rounded-lg hover:bg-muted transition disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE LEAD ROW
// ============================================
function LeadRow({ lead, isSelected, onSelect, onAction, onDelete, onExport, onPrint }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string) => {
    setLoading(true);
    await onAction(lead.id, action);
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    await onDelete(lead.id);
    setLoading(false);
  };

  return (
    <>
      <tr className="hover:bg-muted/30 transition">
        <td className="px-4 py-3">
          <input type="checkbox" checked={isSelected} onChange={onSelect} className="rounded border-input" disabled={loading} />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              {lead.name?.charAt(0) || '?'}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">{lead.name}</p>
              <p className="text-xs text-muted-foreground">{lead.segmento || 'Sin segmento'}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 hidden md:table-cell">
          <p className="text-sm text-foreground truncate max-w-[180px]">{lead.email}</p>
          <p className="text-sm text-muted-foreground">{lead.telefono}</p>
        </td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
            {lead.mensaje || 'Sin mensaje'}
          </p>
        </td>
        <td className="px-4 py-3 hidden sm:table-cell">
          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${STATUS_COLORS[lead.status] || 'bg-gray-100'}`}>
            {STATUS_LABELS[lead.status] || lead.status}
          </span>
        </td>
        <td className="px-4 py-3 hidden xl:table-cell">
          <span className="text-sm text-muted-foreground whitespace-nowrap">{formatDate(lead.createdAt)}</span>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            {lead.telefono && (
              <a
                href={`https://wa.me/${lead.telefono.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-green-500" />
              </a>
            )}
            {lead.status === 'NUEVO' && (
              <button onClick={() => handleAction('LEIDO')} className="p-1.5 hover:bg-muted rounded-lg transition" title="Marcar como leído" disabled={loading}>
                <Check className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <button onClick={handleDelete} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="Eliminar" disabled={loading}>
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => onExport(lead)} className="p-1.5 hover:bg-muted rounded-lg transition" title="Exportar JSON" disabled={loading}>
              <Download className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => onPrint(lead)} className="p-1.5 hover:bg-muted rounded-lg transition" title="Imprimir" disabled={loading}>
              <Printer className="w-4 h-4 text-muted-foreground" />
            </button>
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-muted rounded-lg transition" title={isExpanded ? 'Contraer' : 'Expandir'} disabled={loading}>
              {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr className="bg-muted/20">
          <td colSpan={7} className="px-4 py-4">
            <div className="space-y-3">
              <div className="bg-background rounded-lg p-4 border border-border">
                <p className="whitespace-pre-wrap text-foreground">{lead.mensaje || 'Sin mensaje'}</p>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>📅 {formatDate(lead.createdAt)}</span>
                <span>🏷️ {lead.segmento || 'Sin segmento'}</span>
                {lead.cobertura && <span>📍 {lead.cobertura}</span>}
                {lead.edad && <span>🎂 {lead.edad} años</span>}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

