'use client';

import { useSyncExternalStore, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DE MAPA REUTILIZABLE (Leaflet) — INTERACTIVO
// ═══════════════════════════════════════════════════════════════
//
// Muestra un mapa con un marcador. El marcador se puede:
//   - Arrastrar (si draggable=true)
//   - Reposicionar haciendo clic en el mapa (si onClick esta definido)
//
// El componente NO tiene estado interno para la posicion del marcador.
// La posicion se controla via las props lat/lng. Cuando el usuario
// arrastra o hace clic, se llama onDragEnd/onClick y el PARENT actualiza
// las props lat/lng, lo que hace que el mapa re-renderize con la nueva posicion.
//
// Props:
//   - lat: number | null (latitud)
//   - lng: number | null (longitud)
//   - label: string (texto del popup)
//   - height: string (altura, default '200px')
//   - draggable: boolean (marcador arrastrable, default false)
//   - onDragEnd: (lat: number, lng: number) => void (callback al soltar marcador)
//   - onClick: (lat: number, lng: number) => void (callback al hacer clic en el mapa)
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

// Componente para reposicionar el mapa cuando cambian las coordenadas
function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15, { animate: true });
  }, [map, center[0], center[1]]);
  return null;
}

// Componente para capturar clics en el mapa
function MapClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e: any) => {
      if (onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

interface LeafletMapProps {
  lat: number | null | undefined;
  lng: number | null | undefined;
  label?: string;
  height?: string;
  draggable?: boolean;
  onDragEnd?: (lat: number, lng: number) => void;
  onClick?: (lat: number, lng: number) => void;
}

export default function LeafletMap({
  lat,
  lng,
  label = 'Ubicación',
  height = '200px',
  draggable = false,
  onDragEnd,
  onClick,
}: LeafletMapProps) {
  const mounted = useIsMounted();

  // Determinar si hay coordenadas validas
  const hasCoords = lat !== null && lat !== undefined && lng !== null && lng !== undefined;

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

  // No coordinates y no hay interactividad → mostrar placeholder
  if (!hasCoords && !onClick) {
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

  // Si hay coordenadas, usarlas; si no, centrar en Argentina por defecto
  const position: [number, number] = hasCoords ? [lat as number, lng as number] : [-34.6037, -58.3816];

  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border relative">
      <MapContainer
        center={position}
        zoom={hasCoords ? 15 : 5}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Captura clics en el mapa para reposicionar el marcador */}
        {onClick && <MapClickHandler onClick={onClick} />}
        {/* Marcador (solo si hay coordenadas) */}
        {hasCoords && (
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
                  {(lat as number).toFixed(4)}, {(lng as number).toFixed(4)}
                </span>
                {draggable && (
                  <>
                    <br />
                    <span style={{ fontSize: '10px', color: '#999' }}>
                      Arrastra el marcador o haz clic en el mapa
                    </span>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        )}
        {/* Reposicionar vista cuando cambian las coordenadas */}
        {hasCoords && <ChangeMapView center={position} />}
      </MapContainer>
      {/* Hint overlay para modo interactivo */}
      {(draggable || onClick) && (
        <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-muted-foreground shadow-sm pointer-events-none">
          {hasCoords
            ? '💡 Arrastra el marcador o haz clic en el mapa para ajustar la ubicación'
            : '💡 Haz clic en el mapa para colocar el marcador'}
        </div>
      )}
    </div>
  );
}
