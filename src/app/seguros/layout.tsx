import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Cotizá tu plan de salud',
  description:
    'Compará las mejores opciones de cobertura médica con asesoría personalizada y sin costo. DoctoRed y Grupo Premedic en un solo lugar.',
  keywords: [
    'plan de salud',
    'cobertura médica',
    'DoctoRed',
    'Grupo Premedic',
    'obra social',
    'prepaga',
    'asesoramiento en salud',
  ],
  openGraph: {
    title: 'Cotizá tu plan de salud',
    description:
      'Compará las mejores opciones de cobertura médica con asesoría personalizada y sin costo.',
    type: 'website',
    locale: 'es_AR',
  },
}

export default function SegurosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Providers>{children}</Providers>
}
