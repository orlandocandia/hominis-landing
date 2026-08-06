'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ArrowRight, Building2, MapPin } from 'lucide-react'
import { useTranslation } from './useTranslation'
import { AmarMascotasBenefit } from './AmarMascotasBenefit'
import { MejorCuidadosBenefit } from './MejorCuidadosBenefit'
import { DoctoRedCarrusel } from './DoctoRedCarrusel'
import { COMPANIES, type Company } from './companies'
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'

// Leaflet components cargados dinamicamente (solo cliente) para evitar error SSR
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false })

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

  const handleVerAlcance = () => {
    if (planSeleccionado) {
      window.open(`/pdfs/alcance-plan${planSeleccionado}.pdf`, '_blank')
    }
  }

  const coberturaImages: Record<string, string> = {
    '500': '/images/seguros/cobertura/imagen1-plan500.png',
    '1000': '/images/seguros/cobertura/imagen2-plan1000.png',
    '2000': '/images/seguros/cobertura/imagen3-plan2000.png',
    '3000': '/images/seguros/cobertura/imagen4-plan3000.png',
  }

  // ========== MAPA DE PROVINCIAS ==========
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('CABA')
  const [mapaCentro, setMapaCentro] = useState({ lat: -34.6037, lng: -58.3816, zoom: 5 })

  const provinciasData = [
    {
      nombre: 'CABA',
      lat: -34.6037,
      lng: -58.3816,
      clinicas: ['CEMIC', 'Sanatorio de la Trinidad', 'Sanatorio Finochietto', 'Sanatorio Favaloro', 'Clínica Anchorena', 'Sanatorio Otamendi', 'Mater Dei', 'Fundación Hospitalaria', 'Clínica del Sol', 'Santa Isabel', 'Clínica Basterrica', 'Stamboulian']
    },
    {
      nombre: 'Buenos Aires',
      lat: -34.9200,
      lng: -58.2700,
      clinicas: ['Clínica del Niño de Quilmes', 'Sanatorio Berazategui', 'Clínica Calchaquí', 'Clínica Boedo (Lomas)', 'Clínica Modelo (Lanús)', 'Clínica Espora (Adrogué)', 'Centro Médico Moreno', 'Clínica Morón', 'Cemepro Quilmes', 'GH Salud Berazategui']
    },
    {
      nombre: 'Mendoza',
      lat: -32.8900,
      lng: -68.8400,
      clinicas: ['Hospital Italiano Mendoza', 'Clínica Santa Clara (Godoy Cruz)']
    },
    {
      nombre: 'Córdoba',
      lat: -31.4200,
      lng: -64.1888,
      clinicas: ['Sanatorio Allende Córdoba']
    },
    {
      nombre: 'Santa Fe',
      lat: -32.9500,
      lng: -60.6400,
      clinicas: ['Clínica Universitaria Rosario']
    },
    {
      nombre: 'San Luis',
      lat: -33.2950,
      lng: -66.3350,
      clinicas: ['Federación Médica de San Luis']
    },
    {
      nombre: 'Salta',
      lat: -24.7800,
      lng: -65.4200,
      clinicas: ['Sanatorio Eléctrico Salta']
    },
    {
      nombre: 'Tucumán',
      lat: -26.8083,
      lng: -65.2200,
      clinicas: ['Clínica San Javier']
    },
    {
      nombre: 'Formosa',
      lat: -26.1849,
      lng: -58.1731,
      clinicas: ['Centro Médico DoctoRed']
    }
  ]

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
                  {isDoctored && n === 1 ? 'Precios sanos, planes flexibles.' :
                   isDoctored && n === 2 ? 'Cobertura' :
                   isDoctored && n === 3 ? 'Cobertura en todo el país' :
                   !isDoctored && n === 1 ? 'Planes Grupo Premedic' :
                   !isDoctored && n === 2 ? 'Cobertura' :
                   'Alcance de cobertura'}
                </h2>
                <p className="mt-2 text-sm md:text-base text-muted-foreground text-center max-w-xl mx-auto">
                  {isDoctored && n === 1 ? 'Elegí el tuyo.' :
                   isDoctored && n === 2 ? (planSeleccionado ? `Plan ${planSeleccionado}` : 'Seleccioná un plan') :
                   isDoctored && n === 3 ? 'DoctoRed tiene más de 40.000 prestadores en todas las provincias' :
                   !isDoctored && n === 1 ? 'Seleccioná el plan que mejor se adapte a vos' :
                   !isDoctored && n === 2 ? (planSeleccionado ? `Plan ${planSeleccionado}` : 'Seleccioná un plan') :
                   'Conocé el alcance de tu plan'}
                </p>
              </div>

              {/* SECCION 1: DOCTORED - PLANES */}
              {isDoctored && n === 1 && (
                <div className="rounded-lg p-6 md:p-8 mx-auto w-full flex flex-col justify-center bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
                    {doctoredPlanes.map((plan) => (
                      <div key={plan.numero} className="rounded-lg p-6 md:p-8 text-center shadow-md flex flex-col items-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(4px)', minHeight: '200px' }}>
                        <div className="w-full h-28 md:h-36 lg:h-40 relative mb-2">
                          <Image src={`/images/seguros/${plan.imagen}`} alt={`Plan ${plan.numero}`} fill className="object-cover rounded-t-lg" sizes="(max-width: 768px) 100vw, 25vw" quality={85} />
                        </div>
                        <p className="font-medium text-xl md:text-2xl" style={{ fontFamily: "'Poppins', sans-serif", color: '#3A1E72', fontWeight: 500 }}>Plan {plan.numero}</p>
                        <p className="text-sm md:text-base font-medium" style={{ fontFamily: "'Poppins', sans-serif", color: '#3A1E72', fontWeight: 600 }}>{plan.subtitulo}</p>
                        <p className="text-xs md:text-sm mt-2 flex-1 hidden md:block" style={{ fontFamily: "'Poppins', sans-serif", color: '#3A1E72', fontWeight: 400 }}>{plan.descripcion}</p>
                        <button onClick={() => handleVerCobertura(plan.numero)} className="mt-4 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg w-full text-sm md:text-base" style={{ backgroundColor: '#3A1E72', fontFamily: "'Poppins', sans-serif" }}>Ver cobertura →</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECCION 2: DOCTORED - COBERTURA */}
              {isDoctored && n === 2 && (
                <div className="rounded-lg p-3 md:p-4 mx-auto w-full flex flex-col justify-center border-2 border-gray-100">
                  <div className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden">
                    {planSeleccionado && coberturaImages[planSeleccionado] ? (
                      <Image src={coberturaImages[planSeleccionado]} alt={`Cobertura Plan ${planSeleccionado}`} width={800} height={400} className="object-contain w-full h-auto" priority quality={85} />
                    ) : (
                      <div className="w-full h-64 md:h-96 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">Seleccioná un plan para ver su cobertura</p>
                      </div>
                    )}
                  </div>
                  <button onClick={handleVerAlcance} className="mt-6 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg w-full text-sm md:text-base max-w-md mx-auto" style={{ backgroundColor: '#1a6b3c', fontFamily: "'Poppins', sans-serif" }}>Ver alcance de cobertura →</button>
                </div>
              )}

              {/* SECCION 3 - MAPA INTERACTIVO DE PROVINCIAS */}
              {isDoctored && n === 3 && (
                <div className="max-w-7xl mx-auto w-full">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 md:p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* LISTA DE PROVINCIAS - IZQUIERDA */}
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                          {provinciasData.map((prov) => (
                            <button
                              key={prov.nombre}
                              onClick={() => {
                                setProvinciaSeleccionada(prov.nombre)
                                setMapaCentro({ lat: prov.lat, lng: prov.lng, zoom: 8 })
                              }}
                              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex justify-between items-center ${
                                provinciaSeleccionada === prov.nombre
                                  ? 'bg-blue-600 text-white shadow-md'
                                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                              }`}
                            >
                              <span className="font-medium">{prov.nombre}</span>
                              <span className={`text-xs ${provinciaSeleccionada === prov.nombre ? 'text-white/80' : 'text-gray-400'}`}>
                                {prov.clinicas.length} clínicas
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* MAPA + CLÍNICAS - DERECHA */}
                        <div className="lg:col-span-2">
                          {/* Mapa */}
                          <div className="bg-gray-100 rounded-lg h-[400px] border-2 border-gray-200 relative overflow-hidden">
                            <MapContainer
                              center={[mapaCentro.lat, mapaCentro.lng]}
                              zoom={mapaCentro.zoom || 5}
                              className="w-full h-full"
                              style={{ height: '100%', minHeight: '400px' }}
                            >
                              <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                              />
                              {provinciasData.map((prov) => (
                                prov.lat && prov.lng && (
                                  <Marker
                                    key={prov.nombre}
                                    position={[prov.lat, prov.lng]}
                                    eventHandlers={{
                                      click: () => {
                                        setProvinciaSeleccionada(prov.nombre)
                                        setMapaCentro({ lat: prov.lat, lng: prov.lng, zoom: 8 })
                                      }
                                    }}
                                  >
                                    <Popup>
                                      <div className="text-sm max-w-xs">
                                        <p className="font-bold text-base">{prov.nombre}</p>
                                        <p className="text-xs text-muted-foreground">{prov.clinicas.length} clínicas disponibles</p>
                                        <div className="mt-2 space-y-1">
                                          {prov.clinicas.slice(0, 3).map((clinica, idx) => (
                                            <p key={idx} className="text-xs">{clinica}</p>
                                          ))}
                                          {prov.clinicas.length > 3 && (
                                            <p className="text-xs text-blue-600">+ {prov.clinicas.length - 3} más</p>
                                          )}
                                        </div>
                                      </div>
                                    </Popup>
                                  </Marker>
                                )
                              ))}
                            </MapContainer>
                          </div>

                          {/* CLÍNICAS DE LA PROVINCIA SELECCIONADA */}
                          {provinciaSeleccionada && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                              <h4 className="font-bold text-foreground">{provinciaSeleccionada}</h4>
                              <p className="text-sm text-muted-foreground">Clínicas y centros médicos:</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {provinciasData
                                  .find(p => p.nombre === provinciaSeleccionada)
                                  ?.clinicas.map((clinica, idx) => (
                                    <span key={idx} className="text-xs bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                                      {clinica}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIONES DE PREMEDIC: Placeholder */}
              {!isDoctored && (
                <div className="rounded-lg p-6 md:p-8 mx-auto w-full flex flex-col justify-center bg-white/80 border-2 border-gray-200">
                  <p className="text-center text-muted-foreground">Contenido de la sección {n} de {nombre}</p>
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

        {empresaActiva && (
          <div ref={seccionesRef} className="scroll-mt-20">
            <SeccionesDinamicas empresa={empresaActiva} />
          </div>
        )}
      </div>
    </section>
  )
}
