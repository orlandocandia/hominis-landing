import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Cotizá tu plan | Asesora de Salud',
  description:
    'Cotizá tu plan de salud y encontrá la mejor opción para vos. Grupo Premedic con asesoría personalizada y sin costo.',
  keywords: [
    'plan de salud',
    'cobertura médica',
    'Grupo Premedic',
    'obra social',
    'prepaga',
    'asesoramiento en salud',
  ],
  icons: {
    icon: '/favicon-seguros.svg',
  },
  openGraph: {
    title: 'Cotizá tu plan | Asesora de Salud',
    description:
      'Cotizá tu plan de salud y encontrá la mejor opción para vos.',
    type: 'website',
    locale: 'es_AR',
  },
}

export default function SegurosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
