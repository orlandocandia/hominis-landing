'use client';

import dynamic from 'next/dynamic';

// Client wrapper so server components can use VendedoresMap with ssr:false
const VendedoresMap = dynamic(() => import('@/components/dashboard/VendedoresMap').then(m => ({ default: m.VendedoresMap })), {
  ssr: false,
  loading: () => <div className="h-[500px] rounded-lg border bg-muted/30 flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>,
});

export function VendedoresMapClient({ contactLinkBase = '/vendedor/contactos', height = '500px' }: { contactLinkBase?: string; height?: string }) {
  return <VendedoresMap contactLinkBase={contactLinkBase} height={height} />;
}
