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

  // ========== BUSCADOR DE PRESTADORES ==========
  const [filtros, setFiltros] = useState({
    plan: '',
    provincia: '',
    especialidad: '',
    localidad: ''
  })
  const [resultados, setResultados] = useState<any[]>([])
  const [mapaCentro, setMapaCentro] = useState<{ lat: number; lng: number } | null>(null)
  const mapaRef = useRef<HTMLDivElement>(null)

  const prestadoresMock = [
    // CABA
    { id: 1, nombre: 'Dr. Juan Pérez', especialidad: 'Cardiología', direccion: 'Av. Rivadavia 1234', localidad: 'CABA', provincia: 'CABA', telefono: '011-4444-1111', lat: -34.6037, lng: -58.3816, plan: '500' },
    { id: 2, nombre: 'Dra. María Gómez', especialidad: 'Dermatología', direccion: 'Belgrano 567', localidad: 'CABA', provincia: 'CABA', telefono: '011-4444-2222', lat: -34.6118, lng: -58.3960, plan: '1000' },
    { id: 3, nombre: 'Dr. Carlos López', especialidad: 'Traumatología', direccion: 'San Martín 890', localidad: 'CABA', provincia: 'CABA', telefono: '011-4444-3333', lat: -34.5901, lng: -58.3748, plan: '2000' },
    { id: 4, nombre: 'Clínica Anchorena', especialidad: 'Clínica Médica', direccion: 'Av. Pueyrredón 830', localidad: 'CABA', provincia: 'CABA', telefono: '011-4521-8000', lat: -34.5876, lng: -58.3999, plan: '3000' },
    { id: 5, nombre: 'Clínica Basterrica', especialidad: 'Pediatría', direccion: 'Av. Cabildo 2500', localidad: 'CABA', provincia: 'CABA', telefono: '011-4701-7777', lat: -34.5545, lng: -58.4576, plan: '500' },
    { id: 6, nombre: 'Sanatorio Otamendi', especialidad: 'Ginecología', direccion: 'Av. Alzheimer 850', localidad: 'CABA', provincia: 'CABA', telefono: '011-4824-0000', lat: -34.5833, lng: -58.4122, plan: '1000' },
    { id: 7, nombre: 'CEMIC', especialidad: 'Neurología', direccion: 'Av. Galván 4102', localidad: 'CABA', provincia: 'CABA', telefono: '011-4541-8900', lat: -34.5617, lng: -58.4593, plan: '2000' },
    { id: 8, nombre: 'Sanatorio Finochietto', especialidad: 'Oftalmología', direccion: 'Av. Córdoba 2675', localidad: 'CABA', provincia: 'CABA', telefono: '011-4823-4444', lat: -34.5983, lng: -58.4105, plan: '3000' },
    // Quilmes
    { id: 9, nombre: 'Clínica del Niño de Quilmes', especialidad: 'Pediatría', direccion: 'Alsina 850', localidad: 'Quilmes', provincia: 'Buenos Aires', telefono: '011-4253-1111', lat: -34.7206, lng: -58.2521, plan: '500' },
    { id: 10, nombre: 'Clínica Calchaquí', especialidad: 'Clínica Médica', direccion: 'Calchaquí 1234', localidad: 'Quilmes', provincia: 'Buenos Aires', telefono: '011-4254-2222', lat: -34.7150, lng: -58.2480, plan: '1000' },
    { id: 11, nombre: 'Cemepro Quilmes', especialidad: 'Cardiología', direccion: 'Mitre 456', localidad: 'Quilmes', provincia: 'Buenos Aires', telefono: '011-4255-3333', lat: -34.7220, lng: -58.2600, plan: '2000' },
    // Berazategui
    { id: 12, nombre: 'Sanatorio Berazategui', especialidad: 'Traumatología', direccion: 'Av. 14 1234', localidad: 'Berazategui', provincia: 'Buenos Aires', telefono: '011-4256-4444', lat: -34.7636, lng: -58.2058, plan: '500' },
    { id: 13, nombre: 'GH Salud Berazategui', especialidad: 'Ginecología', direccion: 'Calle 9 567', localidad: 'Berazategui', provincia: 'Buenos Aires', telefono: '011-4257-5555', lat: -34.7550, lng: -58.2100, plan: '1000' },
    // Ranelagh
    { id: 14, nombre: 'Clínica Privada Ranelagh', especialidad: 'Dermatología', direccion: 'Av. Mitre 890', localidad: 'Ranelagh', provincia: 'Buenos Aires', telefono: '011-4258-6666', lat: -34.7833, lng: -58.1833, plan: '2000' },
    { id: 15, nombre: 'Clínica Santa Clara', especialidad: 'Oftalmología', direccion: 'San Martín 123', localidad: 'Ranelagh', provincia: 'Buenos Aires', telefono: '011-4259-7777', lat: -34.7800, lng: -58.1850, plan: '3000' },
    // Lomas de Zamora
    { id: 16, nombre: 'Clínica Boedo', especialidad: 'Clínica Médica', direccion: 'Boedo 456', localidad: 'Lomas de Zamora', provincia: 'Buenos Aires', telefono: '011-4261-8888', lat: -34.7600, lng: -58.4000, plan: '500' },
    { id: 17, nombre: 'Dr. Roberto Sánchez', especialidad: 'Nutrición', direccion: 'España 789', localidad: 'Lomas de Zamora', provincia: 'Buenos Aires', telefono: '011-4262-9999', lat: -34.7650, lng: -58.3950, plan: '1000' },
    // Lanús
    { id: 18, nombre: 'Clínica Modelo Lanús', especialidad: 'Psicología', direccion: '25 de Mayo 321', localidad: 'Lanús', provincia: 'Buenos Aires', telefono: '011-4241-1010', lat: -34.7100, lng: -58.3900, plan: '2000' },
    { id: 19, nombre: 'Dra. Laura Fernández', especialidad: 'Kinesiología', direccion: 'Hipólito Yrigoyen 654', localidad: 'Lanús', provincia: 'Buenos Aires', telefono: '011-4242-1212', lat: -34.7050, lng: -58.3850, plan: '3000' },
    // Adrogué
    { id: 20, nombre: 'Clínica Espora', especialidad: 'Fonoaudiología', direccion: 'Espora 987', localidad: 'Adrogué', provincia: 'Buenos Aires', telefono: '011-4294-1313', lat: -34.7967, lng: -58.3950, plan: '500' },
    { id: 21, nombre: 'Centro Médico Adrogué', especialidad: 'Odontología', direccion: 'Av. Meeks 123', localidad: 'Adrogué', provincia: 'Buenos Aires', telefono: '011-4295-1414', lat: -34.7900, lng: -58.3900, plan: '1000' },
    // Bernal
    { id: 22, nombre: 'Sanatorio Bernal', especialidad: 'Alergia e Inmunología', direccion: 'Av. San Martín 456', localidad: 'Bernal', provincia: 'Buenos Aires', telefono: '011-4251-1515', lat: -34.7100, lng: -58.2900, plan: '2000' },
    // Solano
    { id: 23, nombre: 'Instituto Médico Modelo', especialidad: 'Endocrinología', direccion: 'Av. Monteverde 789', localidad: 'Solano', provincia: 'Buenos Aires', telefono: '011-4252-1616', lat: -34.7150, lng: -58.2700, plan: '3000' },
    // Moreno
    { id: 24, nombre: 'Dr. Martín Díaz', especialidad: 'Gastroenterología', direccion: 'Av. Julio Argentino Roca 234', localidad: 'Moreno', provincia: 'Buenos Aires', telefono: '011-4458-1717', lat: -34.6333, lng: -58.7833, plan: '500' },
    { id: 25, nombre: 'Dra. Silvia Torres', especialidad: 'Oncología', direccion: 'Belgrano 567', localidad: 'Moreno', provincia: 'Buenos Aires', telefono: '011-4459-1818', lat: -34.6300, lng: -58.7800, plan: '1000' },
    { id: 26, nombre: 'Centro Médico Moreno', especialidad: 'Reumatología', direccion: 'Mitre 890', localidad: 'Moreno', provincia: 'Buenos Aires', telefono: '011-4460-1919', lat: -34.6350, lng: -58.7850, plan: '2000' },
    // Morón
    { id: 27, nombre: 'Dr. Pablo Ramírez', especialidad: 'Urología', direccion: 'Av. Rivadavia 15987', localidad: 'Morón', provincia: 'Buenos Aires', telefono: '011-4621-2020', lat: -34.6500, lng: -58.6200, plan: '3000' },
    { id: 28, nombre: 'Dra. Cecilia Ríos', especialidad: 'Medicina General', direccion: 'Almafuerte 321', localidad: 'Morón', provincia: 'Buenos Aires', telefono: '011-4622-2121', lat: -34.6450, lng: -58.6150, plan: '500' },
    { id: 29, nombre: 'Clínica Morón', especialidad: 'Emergencias', direccion: 'Brown 654', localidad: 'Morón', provincia: 'Buenos Aires', telefono: '011-4623-2222', lat: -34.6550, lng: -58.6250, plan: '1000' },
    // Sarandí
    { id: 30, nombre: 'Dr. Federico Cruz', especialidad: 'Cardiología', direccion: 'Av. Mitre 4231', localidad: 'Sarandí', provincia: 'Buenos Aires', telefono: '011-4201-2323', lat: -34.6833, lng: -58.3500, plan: '2000' },
    { id: 31, nombre: 'Dra. Patricia Vega', especialidad: 'Pediatría', direccion: 'Leandro N. Alem 987', localidad: 'Sarandí', provincia: 'Buenos Aires', telefono: '011-4202-2424', lat: -34.6800, lng: -58.3450, plan: '3000' },
    // Córdoba
    { id: 32, nombre: 'Dr. Luis Acuña', especialidad: 'Clínica Médica', direccion: 'Av. Colón 1234', localidad: 'Córdoba', provincia: 'Córdoba', telefono: '0351-421-3344', lat: -31.4201, lng: -64.1888, plan: '500' },
    { id: 33, nombre: 'Sanatorio Allende Córdoba', especialidad: 'Traumatología', direccion: 'Av. Castro Barros 500', localidad: 'Córdoba', provincia: 'Córdoba', telefono: '0351-422-5566', lat: -31.4150, lng: -64.1850, plan: '1000' },
    // Mendoza
    { id: 34, nombre: 'Dra. Sofía Pérez', especialidad: 'Ginecología', direccion: 'Av. San Martín 567', localidad: 'Mendoza', provincia: 'Mendoza', telefono: '0261-429-7788', lat: -32.8900, lng: -68.8400, plan: '2000' },
    { id: 35, nombre: 'Hospital Italiano Mendoza', especialidad: 'Oftalmología', direccion: 'Av. Emilio Civit 850', localidad: 'Mendoza', provincia: 'Mendoza', telefono: '0261-425-9900', lat: -32.8950, lng: -68.8350, plan: '3000' },
    // Rosario
    { id: 36, nombre: 'Dr. Hernán Ruiz', especialidad: 'Neurología', direccion: 'San Martín 890', localidad: 'Rosario', provincia: 'Santa Fe', telefono: '0341-455-1212', lat: -32.9500, lng: -60.6400, plan: '500' },
    { id: 37, nombre: 'Clínica Universitaria Rosario', especialidad: 'Dermatología', direccion: 'Av. Pellegrini 123', localidad: 'Rosario', provincia: 'Santa Fe', telefono: '0341-456-1313', lat: -32.9450, lng: -60.6350, plan: '1000' },
    // Tucumán
    { id: 38, nombre: 'Dr. Marcelo Aguirre', especialidad: 'Psiquiatría', direccion: 'Av. Mate de Luna 456', localidad: 'San Miguel de Tucumán', provincia: 'Tucumán', telefono: '0381-421-1414', lat: -26.8083, lng: -65.2200, plan: '2000' },
    { id: 39, nombre: 'Clínica San Javier', especialidad: 'Kinesiología', direccion: 'Av. Aconquija 789', localidad: 'San Miguel de Tucumán', provincia: 'Tucumán', telefono: '0381-422-1515', lat: -26.8050, lng: -65.2150, plan: '3000' },
    // Salta
    { id: 40, nombre: 'Dra. Carolina Nieva', especialidad: 'Nutrición', direccion: 'Av. Belgrano 123', localidad: 'Salta', provincia: 'Salta', telefono: '0387-431-1616', lat: -24.7821, lng: -65.4232, plan: '500' },
    { id: 41, nombre: 'Sanatorio Eléctrico Salta', especialidad: 'Fonoaudiología', direccion: 'Caseros 456', localidad: 'Salta', provincia: 'Salta', telefono: '0387-432-1717', lat: -24.7800, lng: -65.4200, plan: '1000' },
    // San Luis
    { id: 42, nombre: 'Federación Médica de San Luis', especialidad: 'Clínica Médica', direccion: 'Av. Illia 890', localidad: 'San Luis', provincia: 'San Luis', telefono: '0266-442-1818', lat: -33.2950, lng: -66.3350, plan: '2000' },
    { id: 43, nombre: 'Dr. Ricardo Sosa', especialidad: 'Odontología', direccion: 'Colón 321', localidad: 'San Luis', provincia: 'San Luis', telefono: '0266-443-1919', lat: -33.3000, lng: -66.3300, plan: '3000' },
    // Más CABA
    { id: 44, nombre: 'Sanatorio de la Trinidad', especialidad: 'Emergencias', direccion: 'Cerviño 2550', localidad: 'CABA', provincia: 'CABA', telefono: '011-4826-0001', lat: -34.5678, lng: -58.4234, plan: '500' },
    { id: 45, nombre: 'Mater Dei', especialidad: 'Alergia e Inmunología', direccion: 'Av. Santa Fe 2552', localidad: 'CABA', provincia: 'CABA', telefono: '011-4827-0002', lat: -34.5789, lng: -58.4123, plan: '1000' },
    { id: 46, nombre: 'Stamboulian', especialidad: 'Endocrinología', direccion: 'Av. Corrientes 4072', localidad: 'CABA', provincia: 'CABA', telefono: '011-4828-0003', lat: -34.6012, lng: -58.3998, plan: '2000' },
    { id: 47, nombre: 'Sanatorio Favaloro', especialidad: 'Gastroenterología', direccion: 'Av. Belgrano 1500', localidad: 'CABA', provincia: 'CABA', telefono: '011-4829-0004', lat: -34.6123, lng: -58.3887, plan: '3000' },
    { id: 48, nombre: 'Fundación Hospitalaria', especialidad: 'Oncología', direccion: 'Av. Independencia 2350', localidad: 'CABA', provincia: 'CABA', telefono: '011-4830-0005', lat: -34.6234, lng: -58.3776, plan: '500' },
    { id: 49, nombre: 'Clínica del Sol', especialidad: 'Reumatología', direccion: 'Av. Corrientes 4857', localidad: 'CABA', provincia: 'CABA', telefono: '011-4831-0006', lat: -34.5987, lng: -58.4201, plan: '1000' },
    { id: 50, nombre: 'Santa Isabel', especialidad: 'Urología', direccion: 'Av. La Plata 1909', localidad: 'CABA', provincia: 'CABA', telefono: '011-4832-0007', lat: -34.6345, lng: -58.4098, plan: '2000' },
    { id: 51, nombre: 'Dr. Diego Fernández', especialidad: 'Medicina General', direccion: 'Av. Rivadavia 5678', localidad: 'CABA', provincia: 'CABA', telefono: '011-4833-0008', lat: -34.6456, lng: -58.3987, plan: '3000' },
    { id: 52, nombre: 'Nuevo Sanatorio Berazategui', especialidad: 'Emergencias', direccion: 'Av. 14 2000', localidad: 'Berazategui', provincia: 'Buenos Aires', telefono: '011-4260-0009', lat: -34.7689, lng: -58.2012, plan: '500' },
  ]

  const planes = ['500', '1000', '2000', '3000']
  const provincias = ['Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán']
  const especialidades = ['Cardiología', 'Dermatología', 'Traumatología', 'Pediatría', 'Oftalmología', 'Ginecología', 'Clínica Médica', 'Neurología', 'Nutrición', 'Psicología', 'Psiquiatría', 'Kinesiología', 'Fonoaudiología', 'Odontología', 'Alergia e Inmunología', 'Endocrinología', 'Gastroenterología', 'Oncología', 'Reumatología', 'Urología', 'Medicina General', 'Emergencias']

  const buscarPrestadores = () => {
    console.log('BUSCADOR ACTIVADO - Filtros:', filtros)
    console.log('Total prestadores disponibles:', prestadoresMock.length)
    
    let resultadosFiltrados = prestadoresMock
    
    if (filtros.plan) {
      resultadosFiltrados = resultadosFiltrados.filter(p => p.plan === filtros.plan)
      console.log('Filtrado por plan:', filtros.plan, '->', resultadosFiltrados.length, 'resultados')
    }
    if (filtros.provincia) {
      resultadosFiltrados = resultadosFiltrados.filter(p => 
        p.provincia.toLowerCase().includes(filtros.provincia.toLowerCase())
      )
      console.log('Filtrado por provincia:', filtros.provincia, '->', resultadosFiltrados.length, 'resultados')
    }
    if (filtros.especialidad) {
      resultadosFiltrados = resultadosFiltrados.filter(p => 
        p.especialidad.toLowerCase().includes(filtros.especialidad.toLowerCase())
      )
      console.log('Filtrado por especialidad:', filtros.especialidad, '->', resultadosFiltrados.length, 'resultados')
    }
    if (filtros.localidad) {
      resultadosFiltrados = resultadosFiltrados.filter(p => 
        p.localidad.toLowerCase().includes(filtros.localidad.toLowerCase())
      )
      console.log('Filtrado por localidad:', filtros.localidad, '->', resultadosFiltrados.length, 'resultados')
    }
    
    console.log('Resultados finales:', resultadosFiltrados.length)
    setResultados(resultadosFiltrados)
    
    if (resultadosFiltrados.length > 0 && resultadosFiltrados[0].lat) {
      setMapaCentro({
        lat: resultadosFiltrados[0].lat,
        lng: resultadosFiltrados[0].lng
      })
    }
    if (resultadosFiltrados.length === 0) {
      console.warn('No se encontraron prestadores con esos filtros')
    }
  }

  const limpiarFiltros = () => {
    setFiltros({ plan: '', provincia: '', especialidad: '', localidad: '' })
    setResultados([])
    setMapaCentro(null)
  }

  // Validacion: el boton se habilita solo cuando todos los campos estan completos
  const isFormValid = 
    filtros.plan !== '' && 
    filtros.provincia !== '' && 
    filtros.especialidad !== '' && 
    filtros.localidad !== ''

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
              {/* TITULO DE SECCION - FUERA DEL DIV INTERIOR */}
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-4xl font-bold text-foreground text-center">
                  {isDoctored && n === 1 ? 'Precios sanos, planes flexibles.' :
                   isDoctored && n === 2 ? 'Cobertura' :
                   isDoctored && n === 3 ? 'Buscá prestadores en tu zona' :
                   !isDoctored && n === 1 ? 'Planes Grupo Premedic' :
                   !isDoctored && n === 2 ? 'Cobertura' :
                   'Alcance de cobertura'}
                </h2>
                <p className="mt-2 text-sm md:text-base text-muted-foreground text-center max-w-xl mx-auto">
                  {isDoctored && n === 1 ? 'Elegí el tuyo.' :
                   isDoctored && n === 2 ? (planSeleccionado ? `Plan ${planSeleccionado}` : 'Seleccioná un plan') :
                   isDoctored && n === 3 ? 'Cartilla de prestadores de Doctored' :
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

              {/* SECCION 2: DOCTORED - COBERTURA (con padding reducido) */}
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

              {/* SECCION 3 - BUSCADOR DE PRESTADORES DOCTORED */}
              {isDoctored && n === 3 && (
                <div className="max-w-7xl mx-auto w-full">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 md:p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">Plan</label>
                          <select value={filtros.plan} onChange={(e) => setFiltros({...filtros, plan: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="">Todos los planes</option>
                            {planes.map(p => <option key={p} value={p}>Plan {p}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">Provincia</label>
                          <select value={filtros.provincia} onChange={(e) => setFiltros({...filtros, provincia: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="">Todas</option>
                            {provincias.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">Especialidad</label>
                          <select value={filtros.especialidad} onChange={(e) => setFiltros({...filtros, especialidad: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="">Todas</option>
                            {especialidades.map(e => <option key={e} value={e}>{e}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-foreground mb-1">Localidad</label>
                          <div className="flex flex-wrap gap-1 mb-1">
                            {['Moreno', 'Morón', 'Sarandí', 'Quilmes'].map((loc) => (
                              <button key={loc} onClick={() => setFiltros({...filtros, localidad: loc})} className={`px-2 py-0.5 text-[10px] rounded-full border transition-colors ${filtros.localidad === loc ? 'bg-blue-600 text-white border-blue-600' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}>{loc}</button>
                            ))}
                          </div>
                          <input type="text" placeholder="O escribí tu localidad..." value={filtros.localidad} onChange={(e) => setFiltros({...filtros, localidad: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <button 
                            onClick={() => {
                              console.log('Boton Buscar clickeado')
                              buscarPrestadores()
                            }}
                            disabled={!isFormValid}
                            className={`w-full font-medium py-2 px-4 rounded-lg transition-colors shadow-md text-sm ${
                              isFormValid 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isFormValid ? 'Buscar →' : 'Completá todos los campos'}
                          </button>
                          {!isFormValid && (
                            <p className="text-xs text-muted-foreground text-center w-full">
                              Completá todos los campos para buscar prestadores
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {resultados.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-4">{resultados.length} prestadores encontrados en {filtros.provincia || 'todo el país'}</p>
                      )}
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                          {resultados.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-8">
                              <p>Seleccioná los filtros y presioná "Buscar"</p>
                              <p className="text-xs mt-1">Más de 40.000 prestadores en toda Argentina</p>
                              <p className="text-xs mt-2 text-amber-600">Si no encontrás resultados, probá con CABA o Buenos Aires</p>
                            </div>
                          ) : (
                            resultados.map((prestador, idx) => (
                              <div key={idx} className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => setMapaCentro({ lat: prestador.lat, lng: prestador.lng })}>
                                <p className="font-medium text-sm">{prestador.nombre}</p>
                                <p className="text-xs text-muted-foreground">{prestador.especialidad}</p>
                                <p className="text-xs text-muted-foreground">{prestador.direccion}</p>
                                <p className="text-xs text-muted-foreground">{prestador.localidad}, {prestador.provincia}</p>
                                <p className="text-xs text-muted-foreground">{prestador.telefono}</p>
                                <span className="inline-block text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full mt-1">Plan {prestador.plan}</span>
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
                            <MapContainer
                              center={[mapaCentro?.lat || resultados[0].lat, mapaCentro?.lng || resultados[0].lng]}
                              zoom={12}
                              className="w-full h-full"
                              style={{ height: '100%', minHeight: '350px' }}
                            >
                              <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                              />
                              {resultados.map((prestador) => (
                                <Marker
                                  key={prestador.id}
                                  position={[prestador.lat, prestador.lng]}
                                >
                                  <Popup>
                                    <div className="text-sm">
                                      <p className="font-bold">{prestador.nombre}</p>
                                      <p>{prestador.especialidad}</p>
                                      <p className="text-xs">{prestador.direccion}</p>
                                      <p className="text-xs">{prestador.localidad}, {prestador.provincia}</p>
                                    </div>
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
