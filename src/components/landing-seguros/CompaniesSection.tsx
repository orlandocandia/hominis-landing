'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ArrowRight, Building2, MapPin } from 'lucide-react'
import { useTranslation } from './useTranslation'
import { AmarMascotasBenefit } from './AmarMascotasBenefit'
import { MejorCuidadosBenefit } from './MejorCuidadosBenefit'
import { DoctoRedCarrusel } from './DoctoRedCarrusel'
import { COMPANIES, type Company } from './companies'

const COMPANY_KEYS: Record<string, { desc: string; slogan: string; benefit: string }> = {
  doctored: {
    desc: 'empresas.doctored.desc',
    slogan: 'empresas.doctored.slogan',
    benefit: 'empresas.doctored.benefit',
  },
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
  doctored: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-900/40',
    hoverBg: 'hover:bg-blue-100/50 dark:hover:bg-blue-950/40',
    hoverBorder: 'hover:border-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    btnColor: 'bg-blue-600 hover:bg-blue-700',
  },
  premedic: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-900/40',
    hoverBg: 'hover:bg-green-100/50 dark:hover:bg-green-950/40',
    hoverBorder: 'hover:border-green-500',
    text: 'text-green-600 dark:text-green-400',
    btnColor: 'bg-green-600 hover:bg-green-700',
  },
}

const doctoredPlanes = [
  { numero: '500', imagen: 'plan-500.png', subtitulo: 'Con tus aportes', descripcion: 'Accedé a cobertura médica de calidad sin cuota mensual.' },
  { numero: '1000', imagen: 'plan-1000.png', subtitulo: 'Tu primer plan privado', descripcion: 'Cobertura completa y con excelente cartilla médica.' },
  { numero: '2000', imagen: 'plan-2000.png', subtitulo: 'Más cobertura y comodidad', descripcion: 'Mayor nivel de prestaciones para atenderte con más tranquilidad.' },
  { numero: '3000', imagen: 'plan-3000.png', subtitulo: 'Cobertura total sin límites', descripcion: 'El plan más completo para cuidar tu salud con la máxima tranquilidad.' },
]

interface CompanyCardProps {
  company: Company
  empresaActiva: string | null
  onToggle: (id: string) => void
}

function CompanyCard({ company, empresaActiva, onToggle }: CompanyCardProps) {
  const { t } = useTranslation()
  const styles = COMPANY_STYLES[company.id] || COMPANY_STYLES.doctored
  const isPremedic = company.id === 'premedic'
  const isActive = empresaActiva === company.id

  return (
    <div
      className={`empresa-card group relative flex min-h-[600px] md:min-h-[700px] w-full flex-col items-center justify-start gap-3 md:gap-4 rounded-2xl border-2 px-8 md:px-10 pt-3 md:pt-5 pb-8 md:pb-10 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${styles.bg} ${styles.border} ${styles.hoverBg} ${styles.hoverBorder}`}
    >
      {/* LOGO */}
      <div className="flex items-center justify-center h-16 md:h-24 w-full">
        {isPremedic ? (
          <Image
            src={company.logo}
            alt={`${company.name}`}
            width={160}
            height={56}
            style={{ height: '3rem', width: 'auto' }}
            className="object-contain transition-transform duration-300 group-hover:scale-105 md:!h-14"
            priority
          />
        ) : (
          <Image
            src={company.logo}
            alt={`${company.name}`}
            width={300}
            height={58}
            style={{ width: '14rem', height: 'auto' }}
            className="object-contain transition-transform duration-300 group-hover:scale-105 md:!w-64"
            priority
          />
        )}
      </div>

      {isPremedic ? (
        <>
          <h3 className="text-2xl md:text-3xl font-semibold text-[#1a6b3c] dark:text-green-400 text-center">
            Somos el respaldo que te merecés
          </h3>
          <p className="text-sm md:text-base text-[#4a9a6a] dark:text-green-300 text-center max-w-sm px-2 leading-relaxed">
            La mejor cobertura. Amplia red médica y centros propios para cuidarte a vos y a tu familia.
          </p>
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-1">
            <AmarMascotasBenefit />
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 shadow-sm h-[90px]">
              <div className="flex items-start gap-2">
                <Building2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-foreground">Centros médicos propios</span>
              </div>
            </div>
            <MejorCuidadosBenefit />
            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800 shadow-sm h-[90px]">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-medium text-foreground">Presencia en 5 provincias</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Imagen de fondo DoctoRed */}
          <div className="w-full my-3 rounded-lg overflow-hidden">
            <Image
              src="/images/seguros/fondo_cartel_doctored.png"
              alt="Fondo DoctoRed"
              width={800}
              height={200}
              className="object-cover w-full"
              quality={85}
            />
          </div>
          <div className="text-center">
            <h3 className="text-base md:text-lg font-bold text-foreground">Una red médica que te acompaña en todo el país.</h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl mx-auto">Contamos con una amplia red para que siempre tengas atención médica cerca de tu casa.</p>
          </div>

          {/* CARRUSEL de imágenes (logos de clínicas) - entre el texto gris y el botón */}
          <DoctoRedCarrusel />
        </>
      )}

      {/* BOTÓN "Ver Planes" / "Ocultar planes" con toggle - fino y al fondo del cartel */}
      <button
        onClick={() => onToggle(company.id)}
        className={`mt-auto inline-flex items-center justify-center gap-2 w-full px-4 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-medium text-white transition-all duration-300 group-hover:shadow-lg group-hover:gap-3 ${styles.btnColor}`}
      >
        {isActive ? 'Ocultar planes' : t('empresas.verPlanes')}
        <ArrowRight className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
      </button>
    </div>
  )
}

function SeccionesDinamicas({ empresa }: { empresa: string }) {
  const { t } = useTranslation()
  const nombre = empresa === 'doctored' ? 'DoctoRed' : 'Grupo Premedic'
  const isDoctored = empresa === 'doctored'
  
  // 👇 ESTADO PARA CONTROLAR LA VISIBILIDAD DE LA SECCIÓN 2
  const [mostrarSeccion2, setMostrarSeccion2] = useState(false)
  const [planCoberturaActiva, setPlanCoberturaActiva] = useState<string | null>(null)

  // Mapa de plan numero a imagen de cobertura
  const coberturImages: Record<string, string> = {
    '500': '/images/seguros/cobertura/imagen1-plan500.png',
    '1000': '/images/seguros/cobertura/imagen2-plan1000.png',
    '2000': '/images/seguros/cobertura/imagen3-plan2000.png',
    '3000': '/images/seguros/cobertura/imagen4-plan3000.png',
  }

  // Mapa de plan numero a PDF de alcance de cobertura
  const alcancePdfs: Record<string, string> = {
    '500': '/pdfs/alcance-plan500.pdf',
    '1000': '/pdfs/alcance-plan1000.pdf',
    '2000': '/pdfs/alcance-plan2000.pdf',
    '3000': '/pdfs/alcance-plan3000.pdf',
  }

  // Función para mostrar la Sección 2 y hacer scroll
  const handleVerCobertura = (planNumero: string) => {
    setPlanCoberturaActiva(planNumero)
    setMostrarSeccion2(true)
    setTimeout(() => {
      const seccion2 = document.getElementById('seccion2-cobertura')
      if (seccion2) {
        seccion2.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 200)
  }

  return (
    <div className="mt-8">
      {[1, 2, 3].map((n) => {
        // 👇 SECCIÓN 2: solo se muestra si mostrarSeccion2 es true
        if (n === 2 && !mostrarSeccion2) {
          return null
        }

        return (
          <div 
            key={n} 
            id={n === 2 ? 'seccion2-cobertura' : undefined}
            className="min-h-screen flex flex-col justify-center items-center py-12 px-4"
          >
            {/* Sección 1 de DoctoRed: planes con título y carteles */}
            {isDoctored && n === 1 ? (
              <>
              {/* Título de sección - FUERA del div */}
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-4xl font-bold text-foreground text-center">
                  Precios sanos, planes flexibles.
                </h2>
                <p className="mt-2 text-sm md:text-base text-muted-foreground text-center max-w-xl mx-auto">
                  Elegí el tuyo.
                </p>
              </div>
              <div
                className="rounded-lg p-6 md:p-8 mx-auto w-full flex flex-col justify-center bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900/40 min-h-[600px] md:min-h-[700px] max-w-7xl"
              >
                {/* Grid de 4 planes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
                  {doctoredPlanes.map((plan) => (
                    <div
                      key={plan.numero}
                      className="rounded-lg p-6 md:p-8 text-center shadow-md flex flex-col items-center"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(4px)', minHeight: '200px' }}
                    >
                      {/* Imagen del plan */}
                      <div className="w-full h-28 md:h-36 lg:h-40 relative mb-2">
                        <Image
                          src={`/images/seguros/${plan.imagen}`}
                          alt={`Plan ${plan.numero}`}
                          fill
                          className="object-cover rounded-t-lg"
                          sizes="(max-width: 768px) 100vw, 25vw"
                          quality={85}
                        />
                      </div>
                      <p
                        className="font-medium text-xl md:text-2xl"
                        style={{ fontFamily: "'Poppins', sans-serif", color: '#3A1E72', fontWeight: 500 }}
                      >
                        Plan {plan.numero}
                      </p>
                      <p
                        className="text-sm md:text-base font-medium"
                        style={{ fontFamily: "'Poppins', sans-serif", color: '#3A1E72', fontWeight: 600 }}
                      >
                        {plan.subtitulo}
                      </p>
                      <p
                        className="text-xs md:text-sm mt-2 flex-1 hidden md:block"
                        style={{ fontFamily: "'Poppins', sans-serif", color: '#3A1E72', fontWeight: 400 }}
                      >
                        {plan.descripcion}
                      </p>
                      {/* 👇 BOTÓN "Ver cobertura" que muestra la Sección 2 con la imagen del plan */}
                      <button
                        onClick={() => handleVerCobertura(plan.numero)}
                        className="mt-4 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg w-full text-sm md:text-base"
                        style={{ backgroundColor: '#3A1E72', fontFamily: "'Poppins', sans-serif'" }}
                      >
                        Ver cobertura →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              </>
            ) : isDoctored && n === 2 ? (
              /* 👇 SECCIÓN 2 DE DOCTORED - COBERTURA (IMAGEN SEGÚN PLAN SELECCIONADO) */
              <>
              {/* Título de sección - FUERA del div */}
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-4xl font-bold text-foreground text-center">
                  Cobertura{planCoberturaActiva ? ` - Plan ${planCoberturaActiva}` : ''}
                </h2>
                <p className="mt-2 text-sm md:text-base text-muted-foreground text-center max-w-xl mx-auto">
                  Detalle de la cobertura del plan seleccionado
                </p>
              </div>
              <div className="max-w-7xl mx-auto w-full">
                <div className="rounded-lg p-6 md:p-8 mx-auto w-full flex flex-col justify-center bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900/40 min-h-[400px] md:min-h-[500px]">
                  
                  {/* Imagen de cobertura según el plan seleccionado */}
                  {planCoberturaActiva && coberturImages[planCoberturaActiva] ? (
                    <>
                    <div className="relative w-full h-64 md:h-96 lg:h-[600px] rounded-2xl overflow-hidden">
                      <Image
                        src={coberturImages[planCoberturaActiva]}
                        alt={`Cobertura Plan ${planCoberturaActiva}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 1200px"
                        quality={85}
                        priority
                      />
                    </div>
                    {/* Boton Ver alcance de cobertura */}
                    {alcancePdfs[planCoberturaActiva] && (
                      <div className="text-center mt-4">
                        <a
                          href={alcancePdfs[planCoberturaActiva]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-sm md:text-base"
                          style={{ backgroundColor: '#3A1E72', fontFamily: "'Poppins', sans-serif'" }}
                        >
                          Ver alcance de cobertura
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                    </>
                  ) : (
                    <div className="relative w-full h-64 md:h-96 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
                        Seleccioná un plan para ver su cobertura
                      </p>
                    </div>
                  )}
                </div>
              </div>
              </>
            ) : (
              /* Sección 3 de DoctoRed y todas las de Premedic: placeholder */
              <div className="max-w-4xl mx-auto w-full">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-4xl font-bold text-foreground text-center">
                    Sección {n} {nombre}
                  </h2>
                  <p className="mt-2 text-sm md:text-base text-muted-foreground text-center max-w-xl mx-auto">
                    Contenido de la sección {n} de {nombre}
                  </p>
                </div>
              </div>
            )}
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

    // SCROLL AUTOMÁTICO a la Sección 1 al activar una empresa
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

  // 1. SCROLL - Ocultar al salir del viewport
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

  // 2. CLICK OUTSIDE - Ocultar al hacer clic fuera
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

  // 3. TECLA ESC - Ocultar al presionar Escape
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 w-full max-w-7xl mx-auto mt-2 md:mt-4">
          {COMPANIES.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              empresaActiva={empresaActiva}
              onToggle={toggleEmpresa}
            />
          ))}
        </div>

        {/* SECCIONES DINÁMICAS CON REF */}
        {empresaActiva && (
          <div ref={seccionesRef} className="scroll-mt-20">
            <SeccionesDinamicas empresa={empresaActiva} />
          </div>
        )}
      </div>
    </section>
  )
}
