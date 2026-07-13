// Vendedor layout — server component.
// Solo VENDEDOR.
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { DashboardNav } from '@/components/dashboard-nav';

export default async function VendedorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'VENDEDOR') {
    // ADMIN no pertenece al área de vendedor
    redirect('/admin');
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <DashboardNav
        role={session.user.role}
        userName={session.user.name ?? 'Usuario'}
        userEmail={session.user.email ?? ''}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t bg-card py-4">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground">
          Hominis — Panel de Vendedores © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
