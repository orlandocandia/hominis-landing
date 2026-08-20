/**
 * Catálogo centralizado de empresas representadas en la landing de seguros.
 *
 * Para agregar una nueva empresa en el futuro:
 * 1. Agregá un objeto al array `COMPANIES` con id, name, logo, color y description.
 * 2. Creá el componente de sección (ej. `NuevaEmpresaSection.tsx`) siguiendo el
 *    patrón de `DoctoRedSection.tsx` / `PremedicSection.tsx`.
 * 3. Incluí la nueva sección en `src/app/seguros/page.tsx` con el `id` definido acá.
 *
 * Las tarjetas en `CompaniesSection`, el selector del formulario de contacto y el
 * menú se actualizan automáticamente a partir de esta lista.
 */

export interface Company {
  /** Identificador único, usado como `id` del <section> y value del selector. */
  id: string
  /** Nombre visible de la empresa. */
  name: string
  /** Path relativo del logo dentro de /public. */
  logo: string
  /** Color de marca (hex) para bordes y acentos. */
  color: string
  /** Descripción corta para la tarjeta. */
  description: string
}

export const COMPANIES: Company[] = [
  {
    id: 'premedic',
    name: 'Grupo Premedic',
    logo: '/images/seguros/premedic-logo.png',
    color: '#0056a4',
    description: 'El respaldo que te merecés con amplia red médica.',
  },
]

/**
 * Utility para scroll suave a una sección por su id (con hash).
 * Segura para usar en onClick de cualquier link/nav.
 */
export function scrollToSection(href: string) {
  if (typeof document === 'undefined') return
  const el = document.querySelector(href)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
