// Lista de las 24 provincias de Argentina (incluyendo CABA y Tierra del Fuego).
// Usada en los selectores de provincia del ABM de vendedores y clientes,
// y en el selector múltiple de cobertura del vendedor.

export const PROVINCIAS_ARGENTINA: string[] = [
  'Buenos Aires',
  'CABA (Ciudad Autónoma de Buenos Aires)',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
]

/**
 * Normaliza un nombre de provincia para comparación.
 * Quita acentos, espacios extra, y convierte a minúsculas.
 */
export function normalizeProvincia(provincia: string): string {
  return provincia
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/\s+/g, ' ')
}

/**
 * Verifica si un vendedor cubre una provincia dada.
 * @param coberturaAreas String de provincias separadas por coma (ej: "Misiones, Corrientes, Chaco")
 * @param provincia Provincia a verificar
 * @returns true si el vendedor cubre la provincia
 */
export function vendedorCubreProvincia(coberturaAreas: string | null | undefined, provincia: string): boolean {
  if (!coberturaAreas || !provincia) return false
  const provinciasCobertura = coberturaAreas.split(',').map((p) => p.trim()).filter(Boolean)
  const provinciaNorm = normalizeProvincia(provincia)
  return provinciasCobertura.some((p) => normalizeProvincia(p) === provinciaNorm)
}
