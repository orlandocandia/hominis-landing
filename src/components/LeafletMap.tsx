'use client';

import { useSyncExternalStore, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DE MAPA REUTILIZABLE (Leaflet)
// ═══════════════════════════════════════════════════════════════
//
// Muestra un mapa con un marcador en las coordenadas dadas.
// Se usa en:
//   - Modal de crear/editar vendedor (muestra ubicación geocodificada)
//   - Detalle del vendedor (/admin/vendedores/[id])
//   - Perfil del vendedor (/vendedor/perfil)
//
// Props:
//   - lat: number | null (latitud)
//   - lng: number | null (longitud)
//   - label: string (texto del popup, ej: "Vendedor: Juan Pérez")
//   - height: string (altura del mapa, default '200px')
//   - draggable: boolean (si el marcador se puede arrastrar, default false)
//   - onDragEnd: callback (lat, lng) => void (se llama cuando se suelta el marcador)
// ═══════════════════════════════════════════════════════════════

// SSR-safe hydration check
const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

// Default Leaflet marker icon
function createDefaultMarker() {
  return L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

// Componente interno para reposicionar el mapa cuando cambian las coordenadas
function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15, { animate: true });
  }, [map, center[0], center[1]]);
  return null;
}

interface LeafletMapProps {
  lat: number | null | undefined;
  lng: number | null | undefined;
  label?: string;
  height?: string;
  draggable?: boolean;
  onDragEnd?: (lat: number, lng: number) => void;
}

export default function LeafletMap({
  lat,
  lng,
  label = 'Ubicación',
  height = '200px',
  draggable = false,
  onDragEnd,
}: LeafletMapProps) {
  const mounted = useIsMounted();

  // Load Leaflet CSS dynamically (same pattern as MapWithAgustina)
  useEffect(() => {
    if (document.querySelector('link[href*="leaflet"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);

  // Loading state
  if (!mounted) {
    return (
      <div
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">Cargando mapa...</p>
      </div>
    );
  }

  // No coordinates
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return (
      <div
        className="bg-gray-100 rounded-lg flex items-center justify-center border border-dashed"
        style={{ height }}
      >
        <div className="text-center text-muted-foreground">
          <p className="text-sm">📍 Sin ubicación</p>
          <p className="text-xs mt-1">Geocodifica una dirección para ver el mapa</p>
        </div>
      </div>
    );
  }

  const position: [number, number] = [lat, lng];

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={position}
          icon={createDefaultMarker()}
          draggable={draggable}
          eventHandlers={
            draggable && onDragEnd
              ? {
                  dragend: (e: any) => {
                    const marker = e.target;
                    const newPos = marker.getLatLng();
                    onDragEnd(newPos.lat, newPos.lng);
                  },
                }
              : undefined
          }
        >
          <Popup>
            <div style={{ textAlign: 'center', fontFamily: 'sans-serif', padding: '4px' }}>
              <strong style={{ fontSize: '13px', color: '#1d4ed8' }}>{label}</strong>
              <br />
              <span style={{ fontSize: '11px', color: '#666' }}>
                {lat.toFixed(4)}, {lng.toFixed(4)}
              </span>
            </div>
          </Popup>
        </Marker>
        <ChangeMapView center={position} />
      </MapContainer>
    </div>
  );
}
