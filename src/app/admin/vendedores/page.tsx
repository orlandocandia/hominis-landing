'use client';

// /admin/vendedores — Lista paginada de vendedores con métricas + gestión.
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus, Search, RefreshCw, ChevronLeft, ChevronRight, Loader2,
  Users, Building2, Mail, Phone, Edit3, Eye, Trash2, CheckCircle2, XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface Vendedor {
  id: string;
  name: string;
  apellido: string | null;
  email: string;
  telefono: string | null;
  avatarUrl: string | null;
  isActive: number | boolean;
  empresaId: string | null;
  empresaNombre: string | null;
  city: string | null;
  province: string | null;
  totalLeads: number;
  leadsAtendidos: number;
  tareasPendientes: number;
  tareasCompletadas: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function VendedoresPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, totalPages: 1 });

  const fetchVendedores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/users?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVendedores(data.users || []);
      setPagination(data.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
    } catch {
      toast.error('Error al cargar vendedores');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, search]);

  useEffect(() => { fetchVendedores(); }, [fetchVendedores]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const [page, setPage] = useState(1);
  // keep page in sync with pagination
  useEffect(() => { setPage(pagination.page); }, [pagination.page]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar al vendedor "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      toast.success('Vendedor eliminado');
      fetchVendedores();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(isActive ? 'Vendedor desactivado' : 'Vendedor activado');
      fetchVendedores();
    } catch {
      toast.error('Error al cambiar estado');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </span>
            Vendedores
          </h1>
          <p className="text-sm text-muted-foreground">{pagination.total} vendedores</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/vendedores/nuevo">
            <Plus className="h-4 w-4" /> Nuevo Vendedor
          </Link>
        </Button>
      </div>

      {/* Buscar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={handleSearch} className="gap-2">
          <Search className="h-4 w-4" /> Buscar
        </Button>
        <Button variant="outline" onClick={fetchVendedores} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Actualizar
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      ) : vendedores.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Users className="h-10 w-10 opacity-50" />
            <p>No hay vendedores para mostrar</p>
            <Button variant="link" asChild>
              <Link href="/admin/vendedores/nuevo">Crear tu primer vendedor →</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vendedores.map((v) => {
            const fullName = [v.name, v.apellido].filter(Boolean).join(' ') || v.email;
            const initials = v.name?.charAt(0)?.toUpperCase() || v.email.charAt(0).toUpperCase();
            const isActive = Boolean(v.isActive);

            return (
              <Card key={v.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  {/* Avatar + nombre + estado */}
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{fullName}</p>
                      <Badge
                        variant="secondary"
                        className={
                          isActive
                            ? 'border-transparent bg-emerald-500/15 text-emerald-600'
                            : 'text-zinc-500'
                        }
                      >
                        {isActive ? '🟢 Activo' : '🔴 Inactivo'}
                      </Badge>
                    </div>
                  </div>

                  {/* Datos */}
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 shrink-0" /> {v.email}
                    </p>
                    {v.telefono && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0" /> {v.telefono}
                      </p>
                    )}
                    {v.empresaNombre && (
                      <p className="flex items-center gap-2 truncate">
                        <Building2 className="h-3.5 w-3.5 shrink-0" /> {v.empresaNombre}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{v.totalLeads || 0}</p>
                      <p className="text-[11px] text-muted-foreground">Leads</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{v.tareasPendientes || 0}</p>
                      <p className="text-[11px] text-muted-foreground">Pendientes</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{v.tareasCompletadas || 0}</p>
                      <p className="text-[11px] text-muted-foreground">Completadas</p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
                    <Button size="sm" variant="outline" asChild className="gap-1 text-xs">
                      <Link href={`/admin/vendedores/${v.id}`}>
                        <Eye className="h-3.5 w-3.5" /> Ver
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(v.id, isActive)}
                      className="gap-1 text-xs"
                    >
                      {isActive ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      {isActive ? 'Desact.' : 'Activar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(v.id, fullName)}
                      className="gap-1 text-xs text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="rounded-lg bg-primary/10 px-3 py-1 text-sm">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
