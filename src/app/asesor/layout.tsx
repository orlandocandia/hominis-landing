// Asesor layout — server component.
// Defense-in-depth: middleware already protects /asesor/*, but this layout
// re-verifies the session + role on the server and renders the asesor shell.
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { DashboardNav } from '@/components/dashboard-nav';

export default async function AsesorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'ASESOR') {
    // Authenticated but not asesor → send to their own area
    redirect('/admin/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <DashboardNav
        role={session.user.role}
        userName={session.user.name ?? 'Usuario'}
        userEmail={session.user.email ?? ''}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t bg-white py-4">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground">
          Hominis — Panel de Asesores © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
