'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, LayoutDashboard, Users, FileText, MapPin, UserCircle, Mail, Megaphone, KanbanSquare, BarChart3, Trophy } from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';

interface DashboardNavProps {
  role: string; // 'ADMIN' | 'VENDEDOR' | 'PRODUCTOR'
  userName: string;
  userEmail: string;
}

export function DashboardNav({ role, userName, userEmail }: DashboardNavProps) {
  const router = useRouter();
  const isAdmin = role === 'ADMIN';
  const isProductor = role === 'PRODUCTOR';
  const basePath = isAdmin ? '/admin' : isProductor ? '/productor' : '/vendedor';
  const label = isAdmin ? 'Panel Admin' : isProductor ? 'Panel Productor' : 'Panel Vendedor';

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
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
            <NavLink href={basePath} icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
            {isAdmin && (
              <>
                <NavLink href={`${basePath}/vendedores`} icon={<Users className="h-4 w-4" />} label="Vendedores" />
                <NavLink href={`${basePath}/contactos`} icon={<FileText className="h-4 w-4" />} label="Contactos" />
                <NavLink href={`${basePath}/mapa`} icon={<MapPin className="h-4 w-4" />} label="Mapa" />
                <NavLink href={`${basePath}/invitaciones`} icon={<Mail className="h-4 w-4" />} label="Invitaciones" />
                <NavLink href={`${basePath}/marketing`} icon={<Megaphone className="h-4 w-4" />} label="Marketing" />
                <NavLink href={`${basePath}/reportes`} icon={<BarChart3 className="h-4 w-4" />} label="Reportes" />
                <NavLink href={`${basePath}/leaderboard`} icon={<Trophy className="h-4 w-4" />} label="Ranking" />
              </>
            )}
            {!isAdmin && (
              <>
                <NavLink href={`${basePath}/contactos`} icon={<FileText className="h-4 w-4" />} label="Contactos" />
                <NavLink href="/vendedor/pipeline" icon={<KanbanSquare className="h-4 w-4" />} label="Pipeline" />
                <NavLink href={`${basePath}/mapa`} icon={<MapPin className="h-4 w-4" />} label="Mapa" />
                <NavLink href={`${basePath}/perfil`} icon={<UserCircle className="h-4 w-4" />} label="Perfil" />
              </>
            )}
          </nav>
        </div>

        {/* User + notifications + logout */}
        <div className="flex items-center gap-2">
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
