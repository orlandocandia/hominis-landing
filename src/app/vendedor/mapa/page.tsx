'use client';

import dynamic from 'next/dynamic';

const MapaContent = dynamic(() => import('./MapaContent').then(m => ({ default: m.default })), {
  ssr: false,
  loading: () => <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>,
});

export default function MapaPage() {
  return <MapaContent />;
}
