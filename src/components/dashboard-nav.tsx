'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, LayoutDashboard, Users, FileText, MapPin, UserCircle, Mail, Megaphone, KanbanSquare, BarChart3, Trophy } from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector, useTranslation } from '@/components/language-selector';

interface DashboardNavProps {
  role: string; // 'ADMIN' | 'VENDEDOR' | 'PRODUCTOR'
  userName: string;
  userEmail: string;
}

export function DashboardNav({ role, userName, userEmail }: DashboardNavProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isAdmin = role === 'ADMIN';
  const isProductor = role === 'PRODUCTOR';
  const basePath = isAdmin ? '/admin' : isProductor ? '/productor' : '/vendedor';
  const label = isAdmin
    ? (t('dashboard.title') || 'Panel Admin')
    : isProductor
      ? (t('dashboard.productor_title') || 'Panel Productor')
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
            <NavLink href={basePath} icon={<LayoutDashboard className="h-4 w-4" />} label={t('dashboard.sidebar.dashboard') || 'Dashboard'} />
            {isAdmin && (
              <>
                <NavLink href={`${basePath}/vendedores`} icon={<Users className="h-4 w-4" />} label={t('dashboard.sidebar.vendedores') || 'Vendedores'} />
                <NavLink href={`${basePath}/contactos`} icon={<FileText className="h-4 w-4" />} label={t('dashboard.sidebar.contactos') || 'Contactos'} />
                <NavLink href={`${basePath}/mapa`} icon={<MapPin className="h-4 w-4" />} label={t('dashboard.sidebar.mapa') || 'Mapa'} />
                <NavLink href={`${basePath}/invitaciones`} icon={<Mail className="h-4 w-4" />} label={t('dashboard.sidebar.invitaciones') || 'Invitaciones'} />
                <NavLink href={`${basePath}/marketing`} icon={<Megaphone className="h-4 w-4" />} label={t('dashboard.sidebar.marketing') || 'Marketing'} />
                <NavLink href={`${basePath}/reportes`} icon={<BarChart3 className="h-4 w-4" />} label={t('dashboard.sidebar.reportes') || 'Reportes'} />
                <NavLink href={`${basePath}/leaderboard`} icon={<Trophy className="h-4 w-4" />} label={t('dashboard.sidebar.ranking') || 'Ranking'} />
              </>
            )}
            {!isAdmin && (
              <>
                <NavLink href={`${basePath}/contactos`} icon={<FileText className="h-4 w-4" />} label={t('dashboard.sidebar.contactos') || 'Contactos'} />
                <NavLink href="/vendedor/pipeline" icon={<KanbanSquare className="h-4 w-4" />} label={t('dashboard.sidebar.pipeline') || 'Pipeline'} />
                <NavLink href={`${basePath}/mapa`} icon={<MapPin className="h-4 w-4" />} label={t('dashboard.sidebar.mapa') || 'Mapa'} />
                <NavLink href={`${basePath}/perfil`} icon={<UserCircle className="h-4 w-4" />} label={t('dashboard.sidebar.perfil') || 'Perfil'} />
              </>
            )}
          </nav>
        </div>

        {/* User + notifications + theme + language + logout */}
        <div className="flex items-center gap-1">
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
