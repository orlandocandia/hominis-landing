// POST /api/geocode — geocode an address into lat/lng
// Body: { address: string }
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { geocodeAddress } from '@/lib/geocoding';

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const { address } = await request.json();
    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'address es obligatorio' }, { status: 400 });
    }
    const result = await geocodeAddress(address);
    if (!result) return NextResponse.json({ error: 'Dirección no encontrada' }, { status: 404 });
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('[geocode] error:', e);
    return NextResponse.json({ error: 'Error al geocodificar' }, { status: 500 });
  }
}
