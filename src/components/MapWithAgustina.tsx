'use client';

import { useSyncExternalStore, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// MapPin icon for loading state
function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

// SSR-safe hydration check
const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

// Custom marker with Agustina's photo
function createCustomMarker() {
  const photoUrl = '/agustina_c_candia.png';

  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="position:relative; width:60px; height:72px;">
        <div style="
          position:absolute;
          bottom:0;
          left:50%;
          transform:translateX(-50%);
          width:20px;
          height:6px;
          background:rgba(0,0,0,0.2);
          border-radius:50%;
        "></div>
        <div style="
          width:60px;
          height:60px;
          border-radius:50% 50% 50% 0;
          background: linear-gradient(135deg, #1a237e, #6a1b9a);
          transform: rotate(-45deg);
          position:absolute;
          top:0;
          left:0;
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 3px solid white;
        ">
          <div style="
            width:44px;
            height:44px;
            border-radius:50%;
            overflow:hidden;
            transform: rotate(45deg);
            border: 2px solid white;
          ">
            <img
              src="${photoUrl}"
              alt="Agustina C. Candia"
              style="width:100%; height:100%; object-fit:cover;"
            />
          </div>
        </div>
      </div>
    `,
    iconSize: [60, 72],
    iconAnchor: [30, 72],
    popupAnchor: [0, -72],
  });
}

// Coordinates for Portela 266, Lomas de Zamora
const SUCURSAL_POSITION: [number, number] = [-34.7634, -58.4045];

export default function MapWithAgustina() {
  const mounted = useIsMounted();

  // Load Leaflet CSS dynamically to avoid Turbopack resolution issues
  useEffect(() => {
    if (document.querySelector('link[href*="leaflet"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[400px] bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPinIcon />
          <p className="text-sm">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={SUCURSAL_POSITION}
      zoom={16}
      scrollWheelZoom={false}
      className="w-full h-full min-h-[400px] rounded-2xl z-10"
      style={{ borderRadius: '1rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={SUCURSAL_POSITION} icon={createCustomMarker()}>
        <Popup>
          <div style={{ textAlign: 'center', fontFamily: 'sans-serif', padding: '4px' }}>
            <strong style={{ fontSize: '13px', color: '#1a237e' }}>Oficina Hominis</strong>
            <br />
            <span style={{ fontSize: '12px' }}>Agustina C. Candia</span>
            <br />
            <span style={{ fontSize: '11px', color: '#666' }}>Portela 266, Lomas de Zamora</span>
            <br />
            <a
              href="https://wa.me/5491165555534?text=Hola%20Agustina%2C%20me%20gustar%C3%ADa%20visitarte%20en%20la%20oficina%20de%20Lomas%20de%20Zamora.%20%C2%BFPodr%C3%ADas%20indicarme%20los%20horarios%3F"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '11px', color: '#25D366', textDecoration: 'none', fontWeight: 600 }}
            >
              💬 WhatsApp 11-6555-5534
            </a>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
