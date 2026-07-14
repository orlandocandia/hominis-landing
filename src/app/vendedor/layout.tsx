'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardNav } from '@/components/dashboard-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector } from '@/components/language-selector';
import { NotificationBell } from '@/components/notification-bell';
import { LogOut, Menu, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { HelpButton } from '@/components/help/HelpButton';

export default function VendedorLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) setSidebarOpen(true);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      router.push('/admin');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role === 'ADMIN') return null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 z-50 h-screen w-64 shrink-0 border-r border-border bg-card transition-all duration-300 lg:sticky ${
          isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <span className="text-lg font-bold text-foreground">Hominis CRM</span>
            {isMobile && (
              <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {/* Nav */}
          <div className="flex-1 overflow-y-auto">
            <DashboardNav />
          </div>
          {/* User info + logout */}
          <div className="border-t border-border p-4">
            <div className="mb-2 truncate text-sm font-medium">{session.user.name}</div>
            <div className="mb-3 truncate text-xs text-muted-foreground">{session.user.email}</div>
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted"
            >
              <LogOut className="h-4 w-4" /> Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              {isMobile && (
                <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-1 hover:bg-muted">
                  <Menu className="h-5 w-5" />
                </button>
              )}
              <span className="hidden text-sm text-muted-foreground sm:inline">{session.user.name}</span>
              <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary md:inline">
                {session.user.empresaNombre || 'Sin empresa'}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <NotificationBell />
              <ThemeToggle />
              <LanguageSelector />
              <button
                onClick={() => signOut()}
                className="rounded-lg p-2 transition hover:bg-muted"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
      <HelpButton />
    </div>
  );
}

