'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { LayoutDashboard, Users, MessageSquare, CheckSquare, Building2, Activity, UserCircle } from 'lucide-react';

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const adminNav = [
    { label: '📋 Mensajes', href: '/admin/leads', icon: MessageSquare },
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: '🏢 Empresas', href: '/admin/empresas', icon: Building2 },
    { label: '👥 Vendedores', href: '/admin/vendedores', icon: Users },
    { label: 'Equipo', href: '/admin/equipo', icon: Users },
    { label: '📋 Tareas', href: '/admin/tareas', icon: CheckSquare },
    { label: '📊 Actividad', href: '/admin/actividad', icon: Activity },
  ];

  const vendedorNav = [
    { label: 'Dashboard', href: '/vendedor', icon: LayoutDashboard },
    { label: '📋 Mis Tareas', href: '/vendedor/tareas', icon: CheckSquare },
    { label: '👥 Mis Leads', href: '/vendedor/leads', icon: Users },
    { label: 'Mi Perfil', href: '/vendedor/perfil', icon: UserCircle },
  ];

  const navItems = isAdmin ? adminNav : vendedorNav;

  return (
    <nav className="flex flex-col gap-1 p-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
              isActive
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="truncate text-sm">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
