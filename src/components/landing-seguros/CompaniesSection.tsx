'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ArrowRight, Building2, MapPin, Star, Hospital, Bed, ClipboardList, Smile, Phone, Home, Pill, Plane, Coins, RotateCcw, Award, Check, X } from 'lucide-react'
import { useTranslation } from './useTranslation'
import { AmarMascotasBenefit } from './AmarMascotasBenefit'
import { MejorCuidadosBenefit } from './MejorCuidadosBenefit'
import { COMPANIES, type Company } from './companies'

const COMPANY_KEYS: Record<string, { desc: string; slogan: string; benefit: string }> = {
  premedic: {
    desc: 'empresas.premedic.desc',
    slogan: 'empresas.premedic.slogan',
    benefit: 'empresas.premedic.benefit',
  },
}

const COMPANY_STYLES: Record<string, {
  bg: string
  border: string
  hoverBg: string
  hoverBorder: string
  text: string
  btnColor: string
}> = {
  premedic: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-900/40',
    hoverBg: 'hover:bg-green-100/50 dark:hover:bg-green-950/40',
    hoverBorder: 'hover:border-green-500',
    text: 'text-green-600 dark:text-green-400',
    btnColor: 'bg-green-600 hover:bg-green-700',
  },
}

interface CompanyCardProps {
  company: Company
  empresaActiva: string | null
  onToggle: (id: string) => void
}

function CompanyCard({ company, empresaActiva, onToggle }: CompanyCardProps) {
  const { t } = useTranslation()
  const styles = COMPANY_STYLES[company.id] || COMPANY_STYLES.premedic
  const isActive = empresaActiva === company.id

  return (
    <div
      className={`empresa-card group relative flex min-h-[600px] md:min-h-[700px] w-full flex-col items-center justify-start gap-3 md:gap-4 rounded-2xl border-2 px-8 md:px-10 pt-3 md:pt-5 pb-8 md:pb-10 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${styles.bg} ${styles.border} ${styles.hoverBg} ${styles.hoverBorder}`}
    >
      {/* LOGO */}
      <div className="flex items-center justify-center h-16 md:h-24 w-full">
        <Image
          src={company.logo}
          alt={`${company.name}`}
          width={160}
          height={56}
          style={{ height: '3rem', width: 'auto' }}
          className="object-contain transition-transform duration-300 group-hover:scale-105 md:!h-14"
          priority
        />
      </div>

      <>
        <h3 className="text-2xl md:text-3xl font-semibold text-[#1a6b3c] dark:text-green-400 text-center">
          Somos el respaldo que te merecés
        </h3>
        <p className="text-xs md:text-sm text-[#4a9a6a] dark:text-green-300 text-center max-w-sm px-2 leading-snug">
          La mejor cobertura. Amplia red médica y centros propios para cuidarte a vos y a tu familia.
        </p>

        {/* Título +1000 sanatorios */}
        <p className="text-sm md:text-base font-medium text-[#4a9a6a] dark:text-green-300 text-center mb-3 mt-3">
          Nos apoyan +1000 sanatorios, centros médicos, profesionales en todo el país
        </p>

        {/* Carrusel Premedic - 12 logos, 4 visibles */}
        <div className="my-1 w-full overflow-hidden">
          <div className="flex doctored-carrusel-track">
            {Array.from({ length: 12 }, (_, i) => `/images/seguros/carrusel_premedic/logo-${i + 1}.webp`).concat(
              Array.from({ length: 12 }, (_, i) => `/images/seguros/carrusel_premedic/logo-${i + 1}.webp`)
            ).map((src, index) => (
              <div
                key={index}
                className="flex-shrink-0 flex justify-center items-center p-2"
                style={{ width: '25%' }}
              >
                <div className="relative w-full h-14 md:h-20 lg:h-24">
                  <Image
                    src={src}
                    alt={`Logo Premedic ${(index % 12) + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 25vw, 200px"
                    quality={85}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-3">
          <AmarMascotasBenefit />
          <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 shadow-sm h-[90px]">
            <div className="flex items-start gap-2">
              <Building2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs font-medium text-foreground">Centros médicos propios</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 shadow-sm h-[90px]">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs font-medium text-foreground">Presencia en 5 provincias</span>
            </div>
          </div>
          <MejorCuidadosBenefit />
        </div>
      </>

      {/* BOTÓN "Ver Planes" / "Ocultar planes" con toggle - fino y al fondo del cartel */}
      <button
        onClick={() => onToggle(company.id)}
        className={`mt-4 inline-flex items-center justify-center gap-2 w-full px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-medium text-white transition-all duration-300 group-hover:shadow-lg group-hover:gap-3 ${styles.btnColor}`}
      >
        {isActive ? 'Ocultar planes' : t('empresas.verPlanes')}
        <ArrowRight className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
      </button>
    </div>
  )
}

function SeccionesDinamicas({ empresa }: { empresa: string }) {
  const { t } = useTranslation()

  const [mostrarSeccion2, setMostrarSeccion2] = useState(false)
  const [planSeleccionado, setPlanSeleccionado] = useState<string | null>(null)

  const handleVerCobertura = (planNumero: string) => {
    setPlanSeleccionado(planNumero)
    setMostrarSeccion2(true)
    setTimeout(() => {
      const seccion2 = document.getElementById('seccion2-cobertura')
      if (seccion2) {
        seccion2.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 200)
  }

  // ========== DATOS DE PLANES PREMEDIC ==========
  const premedicPlanes = [
    { id: 'aportes', nombre: 'PLAN POR APORTES' },
    { id: 'simple', nombre: 'PLAN SIMPLE' },
    { id: 'c100', nombre: 'PLAN C-100' },
    { id: '200', nombre: 'PLAN 200' },
    { id: '300', nombre: 'PLAN 300' },
    { id: '400', nombre: 'PLAN 400' },
    { id: '500', nombre: 'PLAN 500' },
  ]

  const premedicFilas = [
    { label: 'Tipo de plan', icono: Star, datos: { 'aportes': 'Por aportes', 'simple': 'Básico', 'c100': 'Estándar', '200': 'Intermedio', '300': 'Avanzado', '400': 'Premium', '500': 'Top' } },
    { label: 'Nivel de cobertura', icono: Award, datos: { 'aportes': 'Básico', 'simple': 'Básico', 'c100': 'Estándar', '200': 'Intermedio', '300': 'Alto', '400': 'Muy alto', '500': 'Máximo' } },
    { label: 'Internación', icono: Hospital, datos: { 'aportes': true, 'simple': true, 'c100': true, '200': true, '300': true, '400': true, '500': true } },
    { label: 'Habitación', icono: Bed, datos: { 'aportes': 'Compartida', 'simple': 'Compartida', 'c100': 'Individual', '200': 'Individual', '300': 'Individual', '400': 'Individual c/baño', '500': 'Suite' } },
    { label: 'Cartilla médica', icono: ClipboardList, datos: { 'aportes': 'Amplia', 'simple': 'Amplia', 'c100': 'Amplia', '200': 'Amplia', '300': 'Muy amplia', '400': 'Muy amplia', '500': 'Nacional' } },
    { label: 'Odontología', icono: Smile, datos: { 'aportes': false, 'simple': true, 'c100': true, '200': true, '300': true, '400': true, '500': true } },
    { label: 'Telemedicina', icono: Phone, datos: { 'aportes': false, 'simple': false, 'c100': true, '200': true, '300': true, '400': true, '500': true } },
    { label: 'Médico a domicilio', icono: Home, datos: { 'aportes': false, 'simple': false, 'c100': false, '200': true, '300': true, '400': true, '500': true } },
    { label: 'Medicamentos', icono: Pill, datos: { 'aportes': '40% desc.', 'simple': '40% desc.', 'c100': '40% desc.', '200': '50% desc.', '300': '50% desc.', '400': '60% desc.', '500': '70% desc.' } },
    { label: 'Asistencia al viajero', icono: Plane, datos: { 'aportes': false, 'simple': false, 'c100': true, '200': true, '300': true, '400': true, '500': true } },
    { label: 'Bonos / Coseguros', icono: Coins, datos: { 'aportes': 'Sin bonos', 'simple': 'Con coseguro', 'c100': 'Con coseguro', '200': 'Bajo coseguro', '300': 'Bajo coseguro', '400': 'Mínimo coseguro', '500': 'Sin coseguro' } },
    { label: 'Reintegros', icono: RotateCcw, datos: { 'aportes': false, 'simple': false, 'c100': false, '200': '30%', '300': '40%', '400': '50%', '500': '60%' } },
    { label: 'Beneficios destacados', icono: Star, datos: { 'aportes': 'Acceso por aportes', 'simple': 'Económico', 'c100': 'Buena relación costo-beneficio', '200': 'Cobertura completa', '300': 'Alta cobertura', '400': 'Premium sin copagos', '500': 'Máxima cobertura' } },
  ]

  // ========== BUSCADOR CARTILLA PREMEDIC (Seccion 3) ==========
  // Estados del buscador de Premedic (cartilla medica, Seccion 3).
  const [filtrosProvincia, setFiltrosProvincia] = useState('')
  const [resultados, setResultados] = useState<any[]>([])
  const [filtrosEspecialidad, setFiltrosEspecialidad] = useState('')
  const [filtrosLocalidad, setFiltrosLocalidad] = useState('')
  const [busquedaRealizada, setBusquedaRealizada] = useState(false)

  // Datos mock de prestadores (cartilla demo). Cubre todas las provincias y
  // especialidades expuestas en los filtros para que la busqueda devuelva
  // resultados variados. Reemplazar por cartilla real cuando este disponible.
  const prestadoresMock = [
    { id: 1, nombre: 'Premedic Medical Center', especialidad: 'Clínica Médica', direccion: 'Av. Rivadavia 1234', localidad: 'CABA', provincia: 'CABA', telefono: '011-4444-1111' },
    { id: 2, nombre: 'Smile Group', especialidad: 'Odontología', direccion: 'Av. Santa Fe 2552', localidad: 'CABA', provincia: 'CABA', telefono: '011-4444-2222' },
    { id: 3, nombre: 'Centro Multidiagnóstico Premedic', especialidad: 'Diagnóstico por Imágenes', direccion: 'Av. Corrientes 4857', localidad: 'CABA', provincia: 'CABA', telefono: '011-4444-3333' },
    { id: 4, nombre: 'Instituto del Corazón Premedic', especialidad: 'Cardiología', direccion: 'Av. Cabildo 1500', localidad: 'CABA', provincia: 'CABA', telefono: '011-4444-4444' },
    { id: 5, nombre: 'Hospital Privado Premedic Norte', especialidad: 'Pediatría', direccion: 'Av. Maipú 2000', localidad: 'Vicente López', provincia: 'Buenos Aires', telefono: '011-4555-1111' },
    { id: 6, nombre: 'Centro Ginecológico Premedic', especialidad: 'Ginecología', direccion: 'San Martín 850', localidad: 'La Plata', provincia: 'Buenos Aires', telefono: '011-4555-2222' },
    { id: 7, nombre: 'Traumato Premedic Sur', especialidad: 'Traumatología', direccion: 'Av. Hipólito Yrigoyen 3200', localidad: 'Lomas de Zamora', provincia: 'Buenos Aires', telefono: '011-4555-3333' },
    { id: 8, nombre: 'Oftalmológica Premedic', especialidad: 'Oftalmología', direccion: 'Av. Meeks 410', localidad: 'Banfield', provincia: 'Buenos Aires', telefono: '011-4555-4444' },
    { id: 9, nombre: 'Sanatorio Premedic Córdoba', especialidad: 'Clínica Médica', direccion: 'Av. Colón 1100', localidad: 'Córdoba', provincia: 'Córdoba', telefono: '0351-444-1111' },
    { id: 10, nombre: 'Centro Odontológico Premedic Córdoba', especialidad: 'Odontología', direccion: 'Av. Vélez Sarsfield 1200', localidad: 'Córdoba', provincia: 'Córdoba', telefono: '0351-444-2222' },
    { id: 11, nombre: 'Instituto Cardiológico Premedic Mendoza', especialidad: 'Cardiología', direccion: 'Av. San Martín 900', localidad: 'Mendoza', provincia: 'Mendoza', telefono: '0261-444-1111' },
    { id: 12, nombre: 'Diagnóstico Premedic Mendoza', especialidad: 'Diagnóstico por Imágenes', direccion: 'Patricias Mendocinas 550', localidad: 'Mendoza', provincia: 'Mendoza', telefono: '0261-444-2222' },
    { id: 13, nombre: 'Hospital Premedic Tucumán', especialidad: 'Pediatría', direccion: 'Av. Mate de Luna 2100', localidad: 'San Miguel de Tucumán', provincia: 'Tucumán', telefono: '0381-444-1111' },
    { id: 14, nombre: 'Ginecología Premedic Tucumán', especialidad: 'Ginecología', direccion: 'Av. Alem 1200', localidad: 'San Miguel de Tucumán', provincia: 'Tucumán', telefono: '0381-444-2222' },
    { id: 15, nombre: 'Sanatorio Premedic Misiones', especialidad: 'Traumatología', direccion: 'Av. Roque Pérez 800', localidad: 'Posadas', provincia: 'Misiones', telefono: '0376-444-1111' },
    { id: 16, nombre: 'Clínica Premedic Santa Fe', especialidad: 'Clínica Médica', direccion: 'Av. Aristóbulo del Valle 2200', localidad: 'Rosario', provincia: 'Santa Fe', telefono: '0341-444-1111' },
    { id: 17, nombre: 'Oftalmología Premedic Santa Fe', especialidad: 'Oftalmología', direccion: 'San Lorenzo 1400', localidad: 'Santa Fe', provincia: 'Santa Fe', telefono: '0342-444-1111' },
    { id: 18, nombre: 'Centro Médico Premedic CABA', especialidad: 'Pediatría', direccion: 'Av. Pueyrredón 1800', localidad: 'CABA', provincia: 'CABA', telefono: '011-4444-5555' },
  ]

  // Funcion de busqueda para la cartilla de Premedic (filtra sobre prestadoresMock).
  const buscarPrestadoresPremedic = () => {
    let filtrados = prestadoresMock
    if (filtrosProvincia) {
      filtrados = filtrados.filter(p =>
        p.provincia.toLowerCase().includes(filtrosProvincia.toLowerCase())
      )
    }
    if (filtrosEspecialidad) {
      filtrados = filtrados.filter(p =>
        p.especialidad.toLowerCase().includes(filtrosEspecialidad.toLowerCase())
      )
    }
    if (filtrosLocalidad.trim()) {
      filtrados = filtrados.filter(p =>
        p.localidad.toLowerCase().includes(filtrosLocalidad.trim().toLowerCase())
      )
    }
    setResultados(filtrados)
    setBusquedaRealizada(true)
  }

  const limpiarFiltrosPremedic = () => {
    setFiltrosProvincia('')
    setFiltrosEspecialidad('')
    setFiltrosLocalidad('')
    setResultados([])
    setBusquedaRealizada(false)
  }

  return (
    <div className="mt-8">
      {[1, 2, 3].map((n) => {
        if (n === 2 && !mostrarSeccion2) {
          return null
        }

        return (
          <div 
            key={n} 
            id={n === 2 ? 'seccion2-cobertura' : undefined}
            className={`min-h-screen flex flex-col justify-center items-center py-12 px-4 ${
              n === 1 ? 'bg-[#F5F7FA]' : 
              n === 2 ? 'bg-white' : 
              'bg-[#EDF2F7]'
            }`}
          >
            <div className="max-w-7xl mx-auto w-full">
              {/* TITULO DE SECCION */}
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-4xl font-bold text-foreground text-center">
                  {n === 1 ? 'PLANES PREMEDIC' :
                   n === 2 ? (planSeleccionado ? (premedicPlanes.find(p => p.id === planSeleccionado)?.nombre || 'Cobertura') : 'Cobertura') :
                   n === 3 ? 'Cartilla Médica' :
                   'Alcance de cobertura'}
                </h2>
                <p className="mt-2 text-sm md:text-base text-muted-foreground text-center max-w-xl mx-auto">
                  {n === 1 ? '7 planes pensados para cada etapa de tu vida' :
                   n === 2 ? '7 planes pensados para cada etapa de tu vida' :
                   n === 3 ? 'Visitá nuestros centros médicos propios' :
                   'Conocé el alcance de tu plan'}
                </p>

              </div>

              {/* SECCION 1 DE PREMEDIC - TABLA COMPARATIVA DE PLANES */}
              {n === 1 && (
                <div 
                  className="rounded-lg p-4 md:p-8 mx-auto w-full flex flex-col justify-center min-h-[600px] md:min-h-[700px] max-w-7xl"
                  style={{ backgroundColor: '#077B7A' }}
                >
                  {/* Tabla con scroll horizontal */}
                  <div className="overflow-x-auto rounded-lg">
                    <table className="w-full text-xs md:text-sm border-collapse">
                      <thead>
                        <tr className="bg-white/10">
                          <th className="p-2 md:p-3 text-left text-white font-semibold sticky left-0 bg-[#077B7A] z-10 min-w-[120px]">COMPARATIVA DE PLANES</th>
                          {premedicPlanes.map((plan) => (
                            <th key={plan.id} className="p-2 md:p-3 text-center text-white font-semibold min-w-[80px] md:min-w-[100px] group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => handleVerCobertura(plan.id)}>
                              <span className="group-hover:text-yellow-300 group-hover:scale-105 inline-flex items-center gap-1 transition-all duration-200">
                                {plan.nombre}
                                <ArrowRight className="w-3 h-3 text-white/60 group-hover:text-yellow-300 group-hover:translate-x-1 transition-all duration-200" />
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {premedicFilas.map((fila, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}>
                            <td className="p-2 md:p-3 text-left text-white/90 font-medium sticky left-0 z-10 min-w-[120px]" style={{ backgroundColor: idx % 2 === 0 ? 'rgba(7,123,122,0.95)' : '#077B7A' }}>
                              <div className="flex items-center gap-1.5">
                                <fila.icono className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 text-white/70" />
                                <span>{fila.label}</span>
                              </div>
                            </td>
                            {premedicPlanes.map((plan) => {
                              const valor = (fila.datos as any)[plan.id];
                              return (
                                <td key={plan.id} className="p-2 md:p-3 text-center text-white/80">
                                  {valor === true ? <Check className="w-4 h-4 text-green-400 mx-auto" /> : 
                                   valor === false ? <X className="w-4 h-4 text-red-400/60 mx-auto" /> : 
                                   <span className="text-xs">{valor}</span>}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Nota */}
                  <p className="text-xs text-white/50 text-center mt-4">Hacé clic en el nombre del plan para ver su cobertura detallada</p>
                </div>
              )}

              {/* SECCION 2 DE PREMEDIC - CARTELITOS INTERACTIVOS SEGUN PLAN */}
              {n === 2 && planSeleccionado && (() => {
                const cantidadPorPlan: Record<string, number> = {
                  'aportes': 11, 'simple': 11, 'c100': 8, '200': 11, '300': 10, '400': 12, '500': 12
                }
                const total = cantidadPorPlan[planSeleccionado] || 0

                const cartelitosAportes = [
                  { icono: 'icono1.svg', imagen: 'imagen1.webp', texto: '+ 200 Clínicas y Sanatorios' },
                  { icono: 'icono2.svg', imagen: 'imagen2.webp', texto: '+ 1000 Centros Médicos y profesionales' },
                  { icono: 'icono3.svg', imagen: 'imagen3.webp', texto: 'Cuota 0, sólo con tu aporte, cobertura integral' },
                  { icono: 'icono4.svg', imagen: 'imagen4.webp', texto: 'Centros médicos propios' },
                  { icono: 'icono5.svg', imagen: 'imagen5.webp', texto: 'Red odontológica propia' },
                  { icono: 'icono6.svg', imagen: 'imagen6.webp', texto: 'Médico por Videollamada' },
                  { icono: 'icono7.svg', imagen: 'imagen7.webp', texto: 'Médico a domicilio sin cargo' },
                  { icono: 'icono8.svg', imagen: 'imagen8.webp', texto: 'Descuentos en amplia red de Farmacias' },
                  { icono: 'icono9.svg', imagen: 'imagen9.webp', texto: 'SIN coseguros en consultas Pediátricas, Clínicas y Ginecológicas' },
                  { icono: 'icono10.svg', imagen: 'imagen10.webp', texto: 'Asistencia al Viajero cobertura nacional y países limítrofes con Cardinal Assistance' },
                  { icono: 'icono11.svg', imagen: 'imagen11.webp', texto: 'Servicios de anticonceptivos a domicilio' },
                ]

                const basePath = '/images/seguros/planporaportes-premedic'

                const cartelitosC100 = [
                  { icono: 'icono1.svg', imagen: 'imagen1.webp', texto: 'Habitación Internación Compartida' },
                  { icono: 'icono3.svg', imagen: 'imagen2.webp', texto: 'Red odontológica propia' },
                  { icono: 'icono3.svg', imagen: 'imagen3.webp', texto: 'Psicología y Kinesioterapia' },
                  { icono: 'icono4.svg', imagen: 'imagen4.webp', texto: 'Médico por Videollamada' },
                  { icono: 'icono5.svg', imagen: 'imagen5.webp', texto: 'Ortodoncia con Arancel Preferencial' },
                  { icono: 'icono6.svg', imagen: 'imagen6.webp', texto: 'Programa de Bienestar' },
                  { icono: 'icono7.svg', imagen: 'imagen7.webp', texto: 'Prótesis implantes Odontológicos' },
                  { icono: 'icono8.svg', imagen: 'imagene8.webp', texto: 'Red de Ópticas con Descuento de 20% a 40%' },
                ]

                const basePathC100 = '/images/seguros/planc100-premedic'

                const cartelitosSimple = [
                  { icono: 'icono1.svg', imagen: 'imagen1.webp', texto: 'Centros médicos propios' },
                  { icono: 'icono2.svg', imagen: 'imagen2.webp', texto: 'Descuentos en amplia red de Farmacias' },
                  { icono: 'icono3.svg', imagen: 'imagen3.webp', texto: 'Médico por Videollamada' },
                  { icono: 'icono4.svg', imagen: 'imagen4.webp', texto: 'Programa de Bienestar' },
                  { icono: 'icono5.svg', imagen: 'imagen5.webp', texto: 'Servicios de anticonceptivos a domicilio' },
                  { icono: 'icono6.svg', imagen: 'imagen6.webp', texto: 'Red odontológica propia' },
                  { icono: 'icono7.svg', imagen: 'imagen7.webp', texto: 'Asistencia al Viajero cobertura nacional y países limítrofes con Cardinal Assistance' },
                  { icono: 'icono8.svg', imagen: 'imagen8.webp', texto: 'Red de Ópticas con Descuento de 20% a 40%' },
                  { icono: 'icono9.webp', imagen: 'imagen9.webp', texto: 'Estudios y prácticas con arancel preferencial' },
                  { icono: 'icono10.webp', imagen: 'imagen10.webp', texto: 'Urgencias y emergencias (no incluye internación)' },
                  { icono: 'icono11.webp', imagen: 'imgen11.webp', texto: 'Todos los meses una consulta sin cargo' },
                ]

                const basePathSimple = '/images/seguros/plansimple-premedic'

                const cartelitosPlan200 = [
                  { icono: 'icono1.svg', imagen: 'imagen1.webp', texto: 'Habitación Internación Compartida' },
                  { icono: 'icono2.svg', imagen: 'imagen2.webp', texto: 'Amplia cartilla en CABA, Buenos Aires y otras provincias.' },
                  { icono: 'icono3.svg', imagen: 'imagen3.webp', texto: 'Centros médicos propios' },
                  { icono: 'icono4.svg', imagen: 'imagen4.webp', texto: 'Red odontológica propia' },
                  { icono: 'icono5.svg', imagen: 'imagen5.webp', texto: 'Médico por Videollamada' },
                  { icono: 'icono6.svg', imagen: 'imagen6.webp', texto: 'Médico a domicilio sin cargo' },
                  { icono: 'icono7.svg', imagen: 'imagen7.webp', texto: 'Programa de Bienestar' },
                  { icono: 'icono8.svg', imagen: 'imagen8.webp', texto: 'Descuentos en amplia red de Farmacias' },
                  { icono: 'icono9.svg', imagen: 'imagen9.webp', texto: 'Plan con coseguros (excepto en guardias, consultas pediátricas, clínicas y de ginecología)' },
                  { icono: 'icono10.svg', imagen: 'imagen10.webp', texto: 'Asistencia al Viajero cobertura nacional y países limítrofes con Cardinal Assistance' },
                  { icono: 'icono11.svg', imagen: 'imagen11.webp', texto: 'Servicios de anticonceptivos a domicilio' },
                ]

                const basePathPlan200 = '/images/seguros/plan200-premedic'

                const cartelitosPlan300 = [
                  { icono: 'icono1.svg', imagen: 'imagen1.webp', texto: 'Red odontológica propia' },
                  { icono: 'icono2.svg', imagen: 'imagen2.webp', texto: 'Habitación Internación Compartida' },
                  { icono: 'icono3.svg', imagen: 'imagen3.webp', texto: 'Amplia cartilla en CABA, Buenos Aires y otras provincias.' },
                  { icono: 'icono4.svg', imagen: 'imagen4.webp', texto: 'Centros médicos propios' },
                  { icono: 'icono5.svg', imagen: 'imagen5.webp', texto: 'Médico a domicilio sin cargo' },
                  { icono: 'icono6.svg', imagen: 'imagen6.webp', texto: 'Médico por Videollamada' },
                  { icono: 'icono7.svg', imagen: 'imagen7.webp', texto: 'Programa de Bienestar' },
                  { icono: 'icono8.svg', imagen: 'imagen8.webp', texto: 'Descuentos en amplia red de Farmacias' },
                  { icono: 'icono9.svg', imagen: 'imagen9.webp', texto: 'Asistencia al Viajero cobertura nacional y países limítrofes con Cardinal Assistance' },
                  { icono: 'icono10.svg', imagen: 'imagen10.webp', texto: 'Servicios de anticonceptivos a domicilio' },
                ]

                const basePathPlan300 = '/images/seguros/plan300-premedic'

                // Plan 400 — 12 cartelitos (todos .svg)
                const cartelitosPlan400 = [
                  { icono: 'icono1.svg', imagen: 'imagen1.webp', texto: 'Habitación individual' },
                  { icono: 'icono2.svg', imagen: 'imagen2.webp', texto: 'Más de 5000 sanatorios, centros médicos y profesionales en CABA, Buenos Aires, Córdoba, Tucumán, Misiones y Mendoza.' },
                  { icono: 'icono3.svg', imagen: 'imagen3.webp', texto: 'Cobertura en internación y cirugía (Según PMO)' },
                  { icono: 'icono4.svg', imagen: 'imagen4.webp', texto: 'Centros médicos propios' },
                  { icono: 'icono5.svg', imagen: 'imagen5.webp', texto: 'Red odontológica propia' },
                  { icono: 'icono6.svg', imagen: 'imagen6.webp', texto: 'Descuentos en Implantes, Ortodoncia y estética dental' },
                  { icono: 'icono7.svg', imagen: 'imagen7.webp', texto: 'Médico a domicilio sin cargo' },
                  { icono: 'icono8.svg', imagen: 'imagen8.webp', texto: 'Médico por Videollamada' },
                  { icono: 'icono9.svg', imagen: 'imagen9.webp', texto: 'Programa de Bienestar' },
                  { icono: 'icono10.svg', imagen: 'imagen10.webp', texto: 'Descuentos en amplia red de Farmacias' },
                  { icono: 'icono11.svg', imagen: 'imagen11.webp', texto: 'Asistencia al Viajero cobertura nacional y países limítrofes con Cardinal Assistance' },
                  { icono: 'icono12.svg', imagen: 'imagen12.webp', texto: 'Servicios de anticonceptivos a domicilio' },
                ]

                const basePathPlan400 = '/images/seguros/plan400-premedic'

                // Plan 500 — 12 cartelitos (todos .svg)
                const cartelitosPlan500 = [
                  { icono: 'icono1.svg', imagen: 'imagen1.webp', texto: 'Habitación individual' },
                  { icono: 'icono2.svg', imagen: 'imagen2.webp', texto: 'Más de 5000 Sanatorios, centros médicos y profesionales de acceso directo en CABA, toda la provincia de Buenos Aires, Córdoba, Tucumán y Misiones y Mendoza' },
                  { icono: 'icono3.svg', imagen: 'imagen3.webp', texto: 'Centros médicos propios' },
                  { icono: 'icono4.svg', imagen: 'imagen4.webp', texto: 'Red odontológica propia' },
                  { icono: 'icono5.svg', imagen: 'imagen5.webp', texto: 'Descuentos en Implantes, Ortodoncia y estética dental' },
                  { icono: 'icono6.svg', imagen: 'imagen6.webp', texto: 'Cobertura en blanqueamientos y tratamientos para dejar de fumar' },
                  { icono: 'icono7.svg', imagen: 'imagen7.webp', texto: 'Médico a domicilio sin cargo' },
                  { icono: 'icono8.svg', imagen: 'imagen8.webp', texto: 'Médico por Videollamada' },
                  { icono: 'icono9.svg', imagen: 'imagen9.webp', texto: 'Programa de Bienestar' },
                  { icono: 'icono10.svg', imagen: 'imagen10.webp', texto: 'Descuentos en amplia red de Farmacias' },
                  { icono: 'icono11.svg', imagen: 'imagen11.webp', texto: 'Asistencia al Viajero cobertura nacional y países limítrofes con Cardinal Assistance' },
                  { icono: 'icono12.svg', imagen: 'imagen12.webp', texto: 'Servicios de anticonceptivos a domicilio' },
                ]

                const basePathPlan500 = '/images/seguros/plan500-premedic'

                return (
                  <div 
                    className="rounded-lg p-6 md:p-8 mx-auto w-full flex flex-col justify-center min-h-[400px] md:min-h-[500px] max-w-7xl"
                    style={{ backgroundColor: '#077B7A' }}
                  >
                    <div className="grid grid-cols-5 gap-4 w-full">
                      {Array.from({ length: total }, (_, i) => i).map((idx) => {
                        const isAportes = planSeleccionado === 'aportes' && cartelitosAportes[idx]
                        const isC100 = planSeleccionado === 'c100' && cartelitosC100[idx]
                        const isSimple = planSeleccionado === 'simple' && cartelitosSimple[idx]
                        const isPlan200 = planSeleccionado === '200' && cartelitosPlan200[idx]
                        const isPlan300 = planSeleccionado === '300' && cartelitosPlan300[idx]
                        const isPlan400 = planSeleccionado === '400' && cartelitosPlan400[idx]
                        const isPlan500 = planSeleccionado === '500' && cartelitosPlan500[idx]
                        const cartelito = isAportes ? cartelitosAportes[idx] : isC100 ? cartelitosC100[idx] : isSimple ? cartelitosSimple[idx] : isPlan200 ? cartelitosPlan200[idx] : isPlan300 ? cartelitosPlan300[idx] : isPlan400 ? cartelitosPlan400[idx] : isPlan500 ? cartelitosPlan500[idx] : null
                        const currentBasePath = isAportes ? basePath : isC100 ? basePathC100 : isSimple ? basePathSimple : isPlan200 ? basePathPlan200 : isPlan300 ? basePathPlan300 : isPlan400 ? basePathPlan400 : isPlan500 ? basePathPlan500 : ''
                        return (
                          <div
                            key={idx}
                            className="group relative aspect-square rounded-lg bg-white/10 border border-white/20 w-full overflow-hidden cursor-pointer"
                          >
                            {cartelito ? (
                              <>
                                {/* Estado normal: icono + texto */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 transition-opacity duration-300 group-hover:opacity-0">
                                  <img
                                    src={`${currentBasePath}/${cartelito.icono}`}
                                    alt={`Icono ${idx + 1}`}
                                    className="w-8 h-8 md:w-10 md:h-10 mb-2"
                                  />
                                  <span className="text-white text-[10px] md:text-xs text-center font-medium leading-tight">
                                    {cartelito.texto}
                                  </span>
                                </div>
                                {/* Estado hover: imagen con fade */}
                                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                  <Image
                                    src={`${currentBasePath}/${cartelito.imagen}`}
                                    alt={`Imagen ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 20vw, 200px"
                                    quality={85}
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center justify-center w-full h-full" />
                            )}
                          </div>
                        )
                      })}
                      {total < 12 && Array.from({ length: 12 - total }, (_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* SECCION 3 DE PREMEDIC - BUSCADOR CARTILLA MEDICA */}
              {n === 3 && (
                <div className="max-w-7xl mx-auto w-full">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 md:p-8">
                      {/* Banner */}
                      <div className="bg-green-50 rounded-lg p-4 mb-6 text-center border border-green-200">
                        <p className="text-green-800 font-medium text-sm md:text-base">
                          Nos apoyan +1000 sanatorios, centros médicos, profesionales en todo el país
                        </p>
                      </div>

                      {/* FILTROS */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">Provincia</label>
                          <select
                            value={filtrosProvincia}
                            onChange={(e) => setFiltrosProvincia(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Todas</option>
                            <option value="CABA">CABA</option>
                            <option value="Buenos Aires">Buenos Aires</option>
                            <option value="Córdoba">Córdoba</option>
                            <option value="Mendoza">Mendoza</option>
                            <option value="Tucumán">Tucumán</option>
                            <option value="Misiones">Misiones</option>
                            <option value="Santa Fe">Santa Fe</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">Especialidad</label>
                          <select
                            value={filtrosEspecialidad}
                            onChange={(e) => setFiltrosEspecialidad(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">Todas</option>
                            <option value="Cardiología">Cardiología</option>
                            <option value="Clínica Médica">Clínica Médica</option>
                            <option value="Odontología">Odontología</option>
                            <option value="Pediatría">Pediatría</option>
                            <option value="Ginecología">Ginecología</option>
                            <option value="Traumatología">Traumatología</option>
                            <option value="Oftalmología">Oftalmología</option>
                            <option value="Diagnóstico por Imágenes">Diagnóstico por Imágenes</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">Localidad</label>
                          <input
                            type="text"
                            placeholder="Escribí una localidad..."
                            value={filtrosLocalidad}
                            onChange={(e) => setFiltrosLocalidad(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') buscarPrestadoresPremedic() }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      {/* Botón Buscar */}
                      <button
                        onClick={buscarPrestadoresPremedic}
                        className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-md text-sm"
                      >
                        Buscar prestadores →
                      </button>

                      {/* Contador de resultados */}
                      {resultados.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-4">
                          {resultados.length} prestador{resultados.length === 1 ? '' : 'es'} encontrado{resultados.length === 1 ? '' : 's'}
                        </p>
                      )}

                      {/* RESULTADOS */}
                      <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-1">
                        {resultados.length === 0 ? (
                          <div className="text-center py-8">
                            {busquedaRealizada ? (
                              <>
                                <p className="text-lg font-medium text-foreground">No encontramos prestadores con esos filtros</p>
                                <p className="text-sm text-muted-foreground mt-2">Probá con otros filtros o limpiá la búsqueda</p>
                                <button onClick={limpiarFiltrosPremedic} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                                  Limpiar filtros
                                </button>
                              </>
                            ) : (
                              <>
                                <p className="text-sm text-muted-foreground">Seleccioná los filtros y presioná “Buscar prestadores”</p>
                                <p className="text-xs text-muted-foreground mt-1">+1000 prestadores en toda Argentina</p>
                              </>
                            )}
                          </div>
                        ) : (
                          resultados.map((prestador, idx) => (
                            <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white">
                              <p className="font-bold text-foreground">{prestador.nombre}</p>
                              <p className="text-sm text-green-600 font-medium">{prestador.especialidad}</p>
                              <p className="text-sm text-muted-foreground mt-1">{prestador.direccion}</p>
                              <p className="text-sm text-muted-foreground">{prestador.localidad}, {prestador.provincia}</p>
                              <p className="text-sm text-muted-foreground">{prestador.telefono}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
export function CompaniesSection() {
  const { t } = useTranslation()
  const [empresaActiva, setEmpresaActiva] = useState<string | null>(null)
  const seccionesRef = useRef<HTMLDivElement>(null)
  const empresasRef = useRef<HTMLElement>(null)

  const toggleEmpresa = (empresa: string) => {
    const nuevaEmpresa = empresaActiva === empresa ? null : empresa
    setEmpresaActiva(nuevaEmpresa)

    if (nuevaEmpresa !== null) {
      setTimeout(() => {
        if (seccionesRef.current) {
          seccionesRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })
        }
      }, 350)
    }
  }

  useEffect(() => {
    if (!empresaActiva) return
    const handleScroll = () => {
      if (seccionesRef.current) {
        const rect = seccionesRef.current.getBoundingClientRect()
        if (rect.bottom < 0) {
          setEmpresaActiva(null)
        }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [empresaActiva])

  useEffect(() => {
    if (!empresaActiva) return
    const handleClickOutside = (e: MouseEvent) => {
      if (seccionesRef.current && !seccionesRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement
        if (!target.closest('.empresa-card')) {
          setEmpresaActiva(null)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [empresaActiva])

  useEffect(() => {
    if (!empresaActiva) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEmpresaActiva(null)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [empresaActiva])

  return (
    <section
      ref={empresasRef}
      id="empresas"
      className="w-full min-h-[calc(100vh-4rem)] flex items-start justify-center scroll-mt-20 bg-white"
      aria-labelledby="empresas-title"
    >
      <div className="w-full px-4 pt-2 md:pt-4 pb-8 md:pb-12">
        <div className="mb-2 md:mb-4 text-center">
          <h2 id="empresas-title" className="text-2xl md:text-4xl font-bold text-foreground">
            {t('empresas.title')}
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            {t('empresas.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:gap-8 w-full max-w-2xl mx-auto mt-2 md:mt-4">
          {COMPANIES.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              empresaActiva={empresaActiva}
              onToggle={toggleEmpresa}
            />
          ))}
        </div>

        {empresaActiva && (
          <div ref={seccionesRef} className="scroll-mt-20">
            <SeccionesDinamicas empresa={empresaActiva} />
          </div>
        )}
      </div>
    </section>
  )
}
