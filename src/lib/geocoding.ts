// Geocoding via OpenStreetMap Nominatim (free, no API key needed)
// Docs: https://nominatim.org/release-docs/develop/api/Search/
// Usage policy: max 1 req/sec, include valid User-Agent / Referer.

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

/**
 * Geocode an address string into lat/lng + structured fields.
 * Returns null if no result found.
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(address)}&addressdetails=1&limit=1&countrycodes=ar`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'hominis-landing/3.0 (asesoradesalud.com.ar)',
      'Accept-Language': 'es',
    },
    // @ts-ignore — Next.js fetch cache option
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Geocoding HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const r = data[0];
  const addr = r.address || {};
  return {
    latitude: parseFloat(r.lat),
    longitude: parseFloat(r.lon),
    displayName: r.display_name,
    city: addr.city || addr.town || addr.village || addr.municipality || addr.county,
    province: addr.state,
    postalCode: addr.postcode,
  };
}

/**
 * Reverse geocode lat/lng into an address string.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'hominis-landing/3.0 (asesoradesalud.com.ar)',
      'Accept-Language': 'es',
    },
    // @ts-ignore
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`Reverse geocoding HTTP ${res.status}`);
  const r = await res.json();
  if (!r || r.error) return null;
  const addr = r.address || {};
  return {
    latitude: parseFloat(r.lat),
    longitude: parseFloat(r.lon),
    displayName: r.display_name,
    city: addr.city || addr.town || addr.village || addr.municipality || addr.county,
    province: addr.state,
    postalCode: addr.postcode,
  };
}

/**
 * Haversine distance in km between two lat/lng points.
 */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
