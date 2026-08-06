import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface Prestador {
  id: number
  nombre: string
  especialidad: string
  direccion: string
  localidad: string
  provincia: string
  telefono: string
  lat: number
  lng: number
}

let cachedData: { p: any[]; prov: string[]; esp: string[] } | null = null

function loadData() {
  if (cachedData) return cachedData
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'prestadores.json')
    const raw = fs.readFileSync(filePath, 'utf-8')
    cachedData = JSON.parse(raw)
    return cachedData
  } catch (e) {
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const provincia = searchParams.get('provincia') || ''
  const especialidad = searchParams.get('especialidad') || ''
  const localidad = searchParams.get('localidad') || ''
  const plan = searchParams.get('plan') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const meta = searchParams.get('meta') === 'true'

  const data = loadData()
  if (!data) {
    return NextResponse.json({ error: 'No se pudieron cargar los datos' }, { status: 500 })
  }

  // If only metadata is requested
  if (meta) {
    return NextResponse.json({
      provincias: data.prov,
      especialidades: data.esp,
      total: data.p.length,
    })
  }

  // Filter prestadores
  let resultados = data.p.map((arr: any[]) => ({
    id: arr[0], nombre: arr[1], especialidad: arr[2], direccion: arr[3],
    localidad: arr[4], provincia: arr[5], telefono: arr[6], lat: arr[7], lng: arr[8]
  }))

  if (provincia) {
    resultados = resultados.filter((p: Prestador) =>
      p.provincia.toLowerCase().includes(provincia.toLowerCase())
    )
  }
  if (especialidad) {
    resultados = resultados.filter((p: Prestador) =>
      p.especialidad.toLowerCase().includes(especialidad.toLowerCase())
    )
  }
  if (localidad) {
    resultados = resultados.filter((p: Prestador) =>
      p.localidad.toLowerCase().includes(localidad.toLowerCase())
    )
  }

  const total = resultados.length
  const start = (page - 1) * limit
  const paginated = resultados.slice(start, start + limit)

  return NextResponse.json({
    resultados: paginated,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}
