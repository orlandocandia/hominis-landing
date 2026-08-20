import { MenuNav } from '@/components/landing-seguros/Menu'
import { Hero } from '@/components/landing-seguros/Hero'
import { CompaniesSection } from '@/components/landing-seguros/CompaniesSection'
import { HowItWorks } from '@/components/landing-seguros/HowItWorks'
import { Contact } from '@/components/landing-seguros/Contact'
import { Footer } from '@/components/landing-seguros/Footer'

/**
 * Landing de seguros — cotiza.asesoradesalud.com.ar
 *
 * Estructura modular: cada sección es un componente independiente en
 * `src/components/landing-seguros/`. Para agregar una nueva empresa,
 * ver instrucciones en `companies.ts`.
 *
 * Secciones (en orden):
 *   1. Hero             (#top)
 *   2. Empresas         (#empresas) — tarjeta clickeable con logo
 *   3. ¿Cómo funciona?  (#como-funciona) — 3 pasos
 *   4. Contacto         (#contacto) — formulario con selector de empresa
 *   5. Footer           — datos de contacto + links legales
 */
export default function SegurosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MenuNav />
      <main className="flex-1">
        <Hero />
        <CompaniesSection />
        <HowItWorks />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
