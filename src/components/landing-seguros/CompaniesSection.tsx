'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ArrowRight, Building2, MapPin, Star, Hospital, Bed, ClipboardList, Smile, Phone, Home, Pill, Plane, Coins, RotateCcw, Award, Check, X } from 'lucide-react'
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

// Fix iconos de Leaflet (solo cliente)
if (typeof window !== 'undefined') {
  import('leaflet').then((L) => {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })
  }).catch(() => {})
}

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
          <p className="text-xs md:text-sm text-[#4a9a6a] dark:text-green-300 text-center max-w-sm px-2 leading-snug">
            La mejor cobertura. Amplia red médica y centros propios para cuidarte a vos y a tu familia.
          </p>

          {/* Título +1000 sanatorios */}
          <p className="text-sm md:text-base font-medium text-[#4a9a6a] dark:text-green-300 text-center mb-3 mt-3">
            Nos apoyan +1000 sanatorios, centros médicos, profesionales en todo el país
          </p>

          {/* Carrusel Premedic - 12 logos, 4 visibles, mas grande que DoctoRed */}
          <div className="my-1 w-full overflow-hidden">
            <div className="flex doctored-carrusel-track">
              {Array.from({ length: 12 }, (_, i) => `/images/seguros/carrusel_premedic/logo-${i + 1}.png`).concat(
                Array.from({ length: 12 }, (_, i) => `/images/seguros/carrusel_premedic/logo-${i + 1}.png`)
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
          </div>

          {/* CARRUSEL de imágenes (logos de clínicas) - entre el texto gris y el botón */}
          <DoctoRedCarrusel />
        </>
      )}

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

  // ========== BUSCADOR DE PRESTADORES ==========
  const [filtros, setFiltros] = useState({ plan: '', provincia: '', especialidad: '', localidad: '' })
  const [resultados, setResultados] = useState<any[]>([])
  const [totalPrestadores, setTotalPrestadores] = useState(0)
  const [cargando, setCargando] = useState(false)
  const [provinciasLista, setProvinciasLista] = useState<string[]>([])
  const [especialidadesLista, setEspecialidadesLista] = useState<string[]>([])
  const [mapaCentro, setMapaCentro] = useState<{ lat: number; lng: number } | null>(null)

  // Cargar metadatos al montar
  useEffect(() => {
    fetch('/api/prestadores?meta=true')
      .then(r => r.json())
      .then(data => {
        setProvinciasLista(data.provincias || [])
        setEspecialidadesLista(data.especialidades || [])
        setTotalPrestadores(data.total || 0)
      })
      .catch(e => console.error('Error cargando metadatos:', e))
  }, [])

  const buscarPrestadores = async () => {
    setCargando(true)
    const params = new URLSearchParams()
    if (filtros.provincia) params.set('provincia', filtros.provincia)
    if (filtros.especialidad) params.set('especialidad', filtros.especialidad)
    if (filtros.localidad) params.set('localidad', filtros.localidad)
    params.set('limit', '100')
    try {
      const res = await fetch(`/api/prestadores?${params}`)
      const data = await res.json()
      setResultados(data.resultados || [])
      if (data.resultados && data.resultados.length > 0) {
        setMapaCentro({ lat: data.resultados[0].lat, lng: data.resultados[0].lng })
      }
    } catch (e) {
      console.error('Error buscando:', e)
    }
    setCargando(false)
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
                  {isDoctored && n === 1 ? 'Precios sanos, planes flexibles.' :
                   isDoctored && n === 2 ? 'Cobertura' :
                   isDoctored && n === 3 ? 'Cobertura en todo el país' :
                   !isDoctored && n === 1 ? 'PLANES PREMEDIC' :
                   !isDoctored && n === 2 ? (planSeleccionado ? (premedicPlanes.find(p => p.id === planSeleccionado)?.nombre || 'Cobertura') : 'Cobertura') :
                   'Alcance de cobertura'}
                </h2>
                <p className="mt-2 text-sm md:text-base text-muted-foreground text-center max-w-xl mx-auto">
                  {isDoctored && n === 1 ? 'Elegí el tuyo.' :
                   isDoctored && n === 2 ? (planSeleccionado ? `Plan ${planSeleccionado}` : 'Seleccioná un plan') :
                   isDoctored && n === 3 ? 'DoctoRed tiene más de 40.000 prestadores en todas las provincias' :
                   !isDoctored && n === 1 ? '7 planes pensados para cada etapa de tu vida' :
                   !isDoctored && n === 2 ? '7 planes pensados para cada etapa de tu vida' :
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

              {/* SECCION 3 - BUSCADOR DE PRESTADORES CON API */}
              {isDoctored && n === 3 && (
                <div className="max-w-7xl mx-auto w-full">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 md:p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">Provincia</label>
                          <select value={filtros.provincia} onChange={(e) => setFiltros({...filtros, provincia: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="">Todas</option>
                            {provinciasLista.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">Especialidad</label>
                          <select value={filtros.especialidad} onChange={(e) => setFiltros({...filtros, especialidad: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="">Todas</option>
                            {especialidadesLista.map(e => <option key={e} value={e}>{e}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">Localidad</label>
                          <input type="text" placeholder="Escribí tu localidad..." value={filtros.localidad} onChange={(e) => setFiltros({...filtros, localidad: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex items-end">
                          <button onClick={buscarPrestadores} disabled={cargando} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-md text-sm disabled:opacity-50">
                            {cargando ? 'Buscando...' : 'Buscar →'}
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-3">{totalPrestadores.toLocaleString()} prestadores en toda Argentina</p>
                      
                      {resultados.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">{resultados.length} prestadores encontrados</p>
                      )}
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                          {resultados.length === 0 ? (
                            <div className="text-center py-12">
                              <p className="text-lg font-medium text-foreground">No encontramos prestadores con esos filtros</p>
                              <p className="text-sm text-muted-foreground mt-2">Probá con otros filtros o eliminá algunos</p>
                              <button onClick={() => { setFiltros({ plan: '', provincia: '', especialidad: '', localidad: '' }); buscarPrestadores() }} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                Limpiar filtros
                              </button>
                            </div>
                          ) : (
                            resultados.map((prestador, idx) => (
                              <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => setMapaCentro({ lat: prestador.lat, lng: prestador.lng })}>
                                <p className="font-bold text-foreground">{prestador.nombre}</p>
                                <p className="text-sm text-blue-600 font-medium">{prestador.especialidad}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <span>{prestador.nombre.includes('CENTRO') || prestador.nombre.includes('CLINICA') || prestador.nombre.includes('SANATORIO') || prestador.nombre.includes('HOSPITAL') || prestador.nombre.includes('INSTITUTO') ? '🏥' : '👩‍⚕️'}</span>
                                  {prestador.nombre.includes('CENTRO') || prestador.nombre.includes('CLINICA') || prestador.nombre.includes('SANATORIO') || prestador.nombre.includes('HOSPITAL') || prestador.nombre.includes('INSTITUTO') ? 'Centro médico' : 'Profesional independiente'}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">{prestador.direccion}</p>
                                <p className="text-sm text-muted-foreground">{prestador.localidad}, {prestador.provincia}</p>
                                <p className="text-sm text-muted-foreground">{prestador.telefono}</p>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="bg-gray-100 rounded-lg h-80 lg:h-auto min-h-[350px] border-2 border-gray-200 relative overflow-hidden">
                          {resultados.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center text-gray-400">
                                <div className="text-5xl mb-2">🗺️</div>
                                <p className="text-sm font-medium">Mapa de prestadores</p>
                                <p className="text-xs">Los resultados aparecerán aquí</p>
                              </div>
                            </div>
                          ) : (
                            <MapContainer center={[mapaCentro?.lat || resultados[0].lat, mapaCentro?.lng || resultados[0].lng]} zoom={12} className="w-full h-full" style={{ height: '100%', minHeight: '350px' }}>
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                              {resultados.map((prestador) => (
                                <Marker key={prestador.id} position={[prestador.lat, prestador.lng]}>
                                  <Popup>
                                    <p className="font-bold">{prestador.nombre}</p>
                                    <p>{prestador.especialidad}</p>
                                    <p className="text-xs">{prestador.direccion}</p>
                                    <p className="text-xs">{prestador.localidad}</p>
                                  </Popup>
                                </Marker>
                              ))}
                            </MapContainer>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECCION 1 DE PREMEDIC - TABLA COMPARATIVA DE PLANES */}
              {!isDoctored && n === 1 && (
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
              {!isDoctored && n === 2 && planSeleccionado && (() => {
                const cantidadPorPlan: Record<string, number> = {
                  'aportes': 11, 'simple': 11, 'c100': 8, '200': 11, '300': 10, '400': 12, '500': 12
                }
                const total = cantidadPorPlan[planSeleccionado] || 0

                const cartelitosAportes = [
                  { icono: 'icono1.svg', imagen: 'imagen1.png', texto: '+ 200 Clínicas y Sanatorios' },
                  { icono: 'icono2.svg', imagen: 'imagen2.png', texto: '+ 1000 Centros Médicos y profesionales' },
                  { icono: 'icono3.svg', imagen: 'imagen3.png', texto: 'Cuota 0, sólo con tu aporte, cobertura integral' },
                  { icono: 'icono4.svg', imagen: 'imagen4.png', texto: 'Centros médicos propios' },
                  { icono: 'icono5.svg', imagen: 'imagen5.png', texto: 'Red odontológica propia' },
                  { icono: 'icono6.svg', imagen: 'imagen6.png', texto: 'Médico por Videollamada' },
                  { icono: 'icono7.svg', imagen: 'imagen7.png', texto: 'Médico a domicilio sin cargo' },
                  { icono: 'icono8.svg', imagen: 'imagen8.png', texto: 'Descuentos en amplia red de Farmacias' },
                  { icono: 'icono9.svg', imagen: 'imagen9.png', texto: 'SIN coseguros en consultas Pediátricas, Clínicas y Ginecológicas' },
                  { icono: 'icono10.svg', imagen: 'imagen10.png', texto: 'Asistencia al Viajero cobertura nacional y países limítrofes con Cardinal Assistance' },
                  { icono: 'icono11.svg', imagen: 'imagen11.png', texto: 'Servicios de anticonceptivos a domicilio' },
                ]

                const basePath = '/images/seguros/planporaportes-premedic'

                const cartelitosC100 = [
                  { icono: 'icono1.svg', imagen: 'imagen1.png', texto: 'Habitación Internación Compartida' },
                  { icono: 'icono3.svg', imagen: 'imagen2.png', texto: 'Red odontológica propia' },
                  { icono: 'icono3.svg', imagen: 'imagen3.png', texto: 'Psicología y Kinesioterapia' },
                  { icono: 'icono4.svg', imagen: 'imagen4.png', texto: 'Médico por Videollamada' },
                  { icono: 'icono5.svg', imagen: 'imagen5.png', texto: 'Ortodoncia con Arancel Preferencial' },
                  { icono: 'icono6.svg', imagen: 'imagen6.png', texto: 'Programa de Bienestar' },
                  { icono: 'icono7.svg', imagen: 'imagen7.png', texto: 'Prótesis implantes Odontológicos' },
                  { icono: 'icono8.svg', imagen: 'imagene8.png', texto: 'Red de Ópticas con Descuento de 20% a 40%' },
                ]

                const basePathC100 = '/images/seguros/planc100-premedic'

                const cartelitosSimple = [
                  { icono: 'icono1.svg', imagen: 'imagen1.png', texto: 'Centros médicos propios' },
                  { icono: 'icono2.svg', imagen: 'imagen2.png', texto: 'Descuentos en amplia red de Farmacias' },
                  { icono: 'icono3.svg', imagen: 'imagen3.png', texto: 'Médico por Videollamada' },
                  { icono: 'icono4.svg', imagen: 'imagen4.png', texto: 'Programa de Bienestar' },
                  { icono: 'icono5.svg', imagen: 'imagen5.png', texto: 'Servicios de anticonceptivos a domicilio' },
                  { icono: 'icono6.svg', imagen: 'imagen6.png', texto: 'Red odontológica propia' },
                  { icono: 'icono7.svg', imagen: 'imagen7.png', texto: 'Asistencia al Viajero cobertura nacional y países limítrofes con Cardinal Assistance' },
                  { icono: 'icono8.svg', imagen: 'imagen8.png', texto: 'Red de Ópticas con Descuento de 20% a 40%' },
                  { icono: 'icono9.png', imagen: 'imagen9.png', texto: 'Estudios y prácticas con arancel preferencial' },
                  { icono: 'icono10.png', imagen: 'imagen10.png', texto: 'Urgencias y emergencias (no incluye internación)' },
                  { icono: 'icono11.png', imagen: 'imgen11.png', texto: 'Todos los meses una consulta sin cargo' },
                ]

                const basePathSimple = '/images/seguros/plansimple-premedic'

                const cartelitosPlan200 = [
                  { icono: 'icono1.svg', imagen: 'imagen1.png', texto: 'Habitación Internación Compartida' },
                  { icono: 'icono2.svg', imagen: 'imagen2.png', texto: 'Amplia cartilla en CABA, la provincia de Buenos Aires, Córdoba, Tucumán, Misiones y Mendoza.' },
                  { icono: 'icono3.svg', imagen: 'imagen3.png', texto: 'Centros médicos propios' },
                  { icono: 'icono4.svg', imagen: 'imagen4.png', texto: 'Red odontológica propia' },
                  { icono: 'icono5.svg', imagen: 'imagen5.png', texto: 'Médico por Videollamada' },
                  { icono: 'icono6.svg', imagen: 'imagen6.png', texto: 'Médico a domicilio sin cargo' },
                  { icono: 'icono7.svg', imagen: 'imagen7.png', texto: 'Programa de Bienestar' },
                  { icono: 'icono8.svg', imagen: 'imagen8.png', texto: 'Descuentos en amplia red de Farmacias' },
                  { icono: 'icono9.svg', imagen: 'imagen9.png', texto: 'Plan con coseguros (excepto en guardias, consultas pediátricas, clínicas y de ginecología)' },
                  { icono: 'icono10.svg', imagen: 'imagen10.png', texto: 'Asistencia al Viajero cobertura nacional y países limítrofes con Cardinal Assistance' },
                  { icono: 'icono11.svg', imagen: 'imagen11.png', texto: 'Servicios de anticonceptivos a domicilio' },
                ]

                const basePathPlan200 = '/images/seguros/plan200-premedic'

                const cartelitosPlan300 = [
                  { icono: 'icono1.png', imagen: 'imagen1.png', texto: 'Red odontológica propia' },
                  { icono: 'icono2.svg', imagen: 'imagen2.png', texto: 'Habitación Internación Compartida' },
                  { icono: 'icono3.svg', imagen: 'imagen3.png', texto: 'Amplia cartilla en CABA, la provincia de Buenos Aires, Córdoba, Tucumán, Misiones y Mendoza.' },
                  { icono: 'icono4.svg', imagen: 'imagen4.png', texto: 'Centros médicos propios' },
                  { icono: 'icono5.svg', imagen: 'imagen5.png', texto: 'Médico a domicilio sin cargo' },
                  { icono: 'icono6.svg', imagen: 'imagen6.png', texto: 'Médico por Videollamada' },
                  { icono: 'icono7.svg', imagen: 'imagen7.png', texto: 'Programa de Bienestar' },
                  { icono: 'icono8.svg', imagen: 'imagen8.png', texto: 'Descuentos en amplia red de Farmacias' },
                  { icono: 'icono9.svg', imagen: 'imagen9.png', texto: 'Asistencia al Viajero cobertura nacional y países limítrofes con Cardinal Assistance' },
                  { icono: 'icono10.svg', imagen: 'imagen10.png', texto: 'Servicios de anticonceptivos a domicilio' },
                ]

                const basePathPlan300 = '/images/seguros/plan300-premedic'

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
                        const cartelito = isAportes ? cartelitosAportes[idx] : isC100 ? cartelitosC100[idx] : isSimple ? cartelitosSimple[idx] : isPlan200 ? cartelitosPlan200[idx] : isPlan300 ? cartelitosPlan300[idx] : null
                        const currentBasePath = isAportes ? basePath : isC100 ? basePathC100 : isSimple ? basePathSimple : isPlan200 ? basePathPlan200 : isPlan300 ? basePathPlan300 : ''
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

              {/* SECCION 3 DE PREMEDIC: Placeholder */}
              {!isDoctored && n === 3 && (
                <div className="rounded-lg p-6 md:p-8 mx-auto w-full flex flex-col justify-center bg-white/80 border-2 border-gray-200">
                  <p className="text-center text-muted-foreground">Próximamente: buscador de prestadores de Premedic</p>
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
