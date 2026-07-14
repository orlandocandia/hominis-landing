'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, LayoutDashboard, Users, FileText, UserCircle, ClipboardList, Building2, Activity } from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';
import { EmpresaSelector } from '@/components/empresa-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector, useTranslation } from '@/components/language-selector';

interface DashboardNavProps {
  role: string; // 'ADMIN' | 'VENDEDOR'
  userName: string;
  userEmail: string;
}

export function DashboardNav({ role, userName, userEmail }: DashboardNavProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isAdmin = role === 'ADMIN';
  const basePath = isAdmin ? '/admin' : '/vendedor';
  const label = isAdmin
    ? (t('dashboard.title') || 'Panel Admin')
    : (t('dashboard.vendedor_title') || 'Panel Vendedor');

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-hominis-blue to-hominis-violet">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="block text-sm font-bold text-foreground">Hominis</span>
              <span className="block text-[11px] text-muted-foreground">{label}</span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden items-center gap-1 md:flex">
            {isAdmin && (
              <>
                <NavLink href={`${basePath}/leads`} icon={<FileText className="h-4 w-4" />} label="📋 Mensajes" />
                <NavLink href={basePath} icon={<LayoutDashboard className="h-4 w-4" />} label={t('dashboard.sidebar.dashboard') || 'Dashboard'} />
                <NavLink href={`${basePath}/empresas`} icon={<Building2 className="h-4 w-4" />} label="🏢 Empresas" />
                <NavLink href={`${basePath}/vendedores`} icon={<Users className="h-4 w-4" />} label={t('dashboard.sidebar.vendedores') || 'Vendedores'} />
                <NavLink href={`${basePath}/equipo`} icon={<Users className="h-4 w-4" />} label="Equipo" />
                <NavLink href={`${basePath}/tareas`} icon={<ClipboardList className="h-4 w-4" />} label="📋 Tareas" />
                <NavLink href={`${basePath}/actividad`} icon={<Activity className="h-4 w-4" />} label="📊 Actividad" />
              </>
            )}
            {!isAdmin && (
              <>
                <NavLink href={basePath} icon={<LayoutDashboard className="h-4 w-4" />} label={t('dashboard.sidebar.dashboard') || 'Dashboard'} />
                <NavLink href="/vendedor/tareas" icon={<ClipboardList className="h-4 w-4" />} label="📋 Mis Tareas" />
                <NavLink href="/vendedor/leads" icon={<Users className="h-4 w-4" />} label="👥 Mis Leads" />
                <NavLink href={`${basePath}/perfil`} icon={<UserCircle className="h-4 w-4" />} label={t('dashboard.sidebar.perfil') || 'Mi Perfil'} />
              </>
            )}
          </nav>
        </div>

        {/* User + notifications + theme + language + logout */}
        <div className="flex items-center gap-1">
          <EmpresaSelector />
          <LanguageSelector />
          <ThemeToggle />
          <NotificationBell />
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium text-foreground">{userName}</div>
            <div className="text-[11px] text-muted-foreground">{userEmail}</div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {icon}
      {label}
    </a>
  );
}
