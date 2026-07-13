'use client';

// EmpresaSelector — dropdown para que el ADMIN cambie la empresa activa.
// Usa useSession().update() para propagar el cambio a TODAS las APIs via JWT.
// VENDEDOR no ve este componente (su empresa es fija).
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2 } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Empresa {
  id: string;
  nombre: string;
  rubro: string;
}

// Sentinel for "all empresas" (ADMIN can see all data)
const ALL = '__all__';

export function EmpresaSelector() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/empresas')
      .then((r) => r.json())
      .then((data: Empresa[]) => {
        setEmpresas(Array.isArray(data) ? data : data.empresas ?? []);
      })
      .catch(() => {});
  }, []);

  // Solo mostrar para ADMIN con más de 1 empresa disponible
  if (session?.user?.role !== 'ADMIN' || empresas.length < 2) {
    return null;
  }

  // Valor actual: si session.user.empresaId es null → "todas", si no → esa empresa
  const currentValue = session.user.empresaId || ALL;

  const cambiarEmpresa = async (value: string) => {
    setLoading(true);
    const empresaId = value === ALL ? null : value;
    const empresa = empresas.find((e) => e.id === value);

    // Actualizar la sesión JWT — propaga session.user.empresaId a todas las APIs
    await update({
      empresaId,
      empresaNombre: empresa?.nombre ?? null,
    });

    // Forzar recarga de la página para que TODOS los componentes refetchen datos
    // con el nuevo empresaId de la sesión
    router.refresh();
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <Select value={currentValue} onValueChange={cambiarEmpresa} disabled={loading}>
      <SelectTrigger className="h-9 w-[180px] gap-1.5 text-sm" aria-label="Selector de empresa">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Building2 className="h-4 w-4 text-muted-foreground" />
        )}
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>Todas las empresas</SelectItem>
        {empresas.map((emp) => (
          <SelectItem key={emp.id} value={emp.id}>
            {emp.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
