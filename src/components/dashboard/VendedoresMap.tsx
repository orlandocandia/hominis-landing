'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { Loader2, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Vendor {
  id: string;
  nombre: string;
  apellido: string | null;
  email: string;
  rol: string;
  city: string | null;
  province: string | null;
  latitude: number;
  longitude: number;
  serviceRadius: number;
  totalContacts: number;
  conversionRate: number;
  avatarUrl: string | null;
}

interface Contact {
  id: string;
  name: string;
  address: string;
  city: string | null;
  latitude: number;
  longitude: number;
  status: string;
  segment: string | null;
  ownerNombre: string | null;
  ownerApellido: string | null;
}

interface VendedoresMapProps {
  showVendors?: boolean; // default true
  showContacts?: boolean; // default true
  contactLinkBase?: string; // '/vendedor/contactos' or '/admin/contactos'
  height?: string; // default '500px'
}

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

const STATUS_COLORS: Record<string, string> = {
  NUEVO: '#3b82f6',
  LEIDO: '#a855f7',
  ATENDIDO: '#10b981',
  RECHAZADO: '#ef4444',
};

export function VendedoresMap({
  showVendors = true,
  showContacts = true,
  contactLinkBase = '/vendedor/contactos',
  height = '500px',
}: VendedoresMapProps) {
  const mounted = useIsMounted();
  const [leafletReady, setLeafletReady] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!document.querySelector('link[data-leaflet-css]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.setAttribute('data-leaflet-css', 'true');
      document.head.appendChild(link);
    }
    const t = setTimeout(() => setLeafletReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    fetch('/api/crm/map')
      .then((r) => r.json())
      .then((d) => {
        setVendors(d.vendors || []);
        setContacts(d.contacts || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Vendor marker (blue, with photo or initials)
  const vendorIcon = (v: Vendor) => {
    const initials = ((v.nombre[0] || '') + (v.apellido?.[0] || '')).toUpperCase();
    const isProductor = v.rol === 'PRODUCTOR';
    const color = isProductor ? '#8b5cf6' : '#3b82f6';
    return L.divIcon({
      className: 'vendor-map-marker',
      html: `<div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,${color},${color}dd);box-shadow:0 2px 10px rgba(0,0,0,0.3);border:3px solid white;">
        <span style="color:white;font-weight:700;font-size:14px;font-family:system-ui;">${initials}</span>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  // Contact marker (pink, smaller)
  const contactIcon = (c: Contact) => {
    const color = STATUS_COLORS[c.status] || '#ec4899';
    return L.divIcon({
      className: 'contact-map-marker',
      html: `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);box-shadow:0 1px 6px rgba(0,0,0,0.3);border:2px solid white;">
        <div style="transform:rotate(45deg);width:8px;height:8px;background:white;border-radius:50%;"></div>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
    });
  };

  if (!mounted || !leafletReady || loading) {
    return (
      <div className="rounded-lg border bg-muted/30 flex items-center justify-center" style={{ height }}>
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Center on first vendor, or first contact, or default
  const center: [number, number] =
    vendors.length > 0
      ? [vendors[0].latitude, vendors[0].longitude]
      : contacts.length > 0
        ? [contacts[0].latitude, contacts[0].longitude]
        : [-34.7629, -58.4014];

  return (
    <div className="space-y-3">
      <div className="rounded-lg border overflow-hidden" style={{ height }}>
        <MapContainer center={center} zoom={11} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Vendor coverage circles + markers */}
          {showVendors && vendors.map((v) => (
            <div key={`v-${v.id}`}>
              <Circle
                center={[v.latitude, v.longitude]}
                radius={v.serviceRadius * 1000} // km → m
                pathOptions={{ color: v.rol === 'PRODUCTOR' ? '#8b5cf6' : '#3b82f6', fillColor: v.rol === 'PRODUCTOR' ? '#8b5cf6' : '#3b82f6', fillOpacity: 0.08, weight: 1.5, dashArray: '6 4' }}
              />
              <Marker position={[v.latitude, v.longitude]} icon={vendorIcon(v)}>
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <strong>{v.nombre} {v.apellido || ''}</strong>
                      <Badge variant={v.rol === 'PRODUCTOR' ? 'default' : 'secondary'} className="text-[10px] py-0">{v.rol}</Badge>
                    </div>
                    {v.city && <p className="text-xs text-gray-600">{v.city}, {v.province || ''}</p>}
                    <p className="text-xs text-gray-600">{v.email}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-gray-500">Contactos:</span> <strong>{v.totalContacts}</strong></div>
                      <div><span className="text-gray-500">Conversión:</span> <strong>{v.conversionRate}%</strong></div>
                      <div className="col-span-2"><span className="text-gray-500">Cobertura:</span> <strong>{v.serviceRadius} km</strong></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </div>
          ))}
          {/* Contact markers */}
          {showContacts && contacts.map((c) => (
            <Marker key={`c-${c.id}`} position={[c.latitude, c.longitude]} icon={contactIcon(c)}>
              <Popup>
                <div className="min-w-[180px]">
                  <strong>{c.name}</strong>
                  <p className="text-xs text-gray-600">{c.address}</p>
                  {c.city && <p className="text-xs text-gray-600">{c.city}</p>}
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] py-0">{c.status}</Badge>
                    {c.segment && <Badge variant="secondary" className="text-[10px] py-0">{c.segment.replace('_', ' ')}</Badge>}
                  </div>
                  {c.ownerNombre && <p className="text-xs text-gray-500 mt-1">Asignado a: {c.ownerNombre} {c.ownerApellido || ''}</p>}
                  <Link href={`${contactLinkBase}/${c.id}`} className="text-blue-600 text-xs hover:underline mt-2 inline-block">
                    Ver detalle →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {showVendors && (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 border border-white shadow" /> Vendedor
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500 border border-white shadow" /> Productor
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-3 rounded-full border border-dashed border-blue-400 bg-blue-400/10" /> Radio de cobertura
            </span>
          </>
        )}
        {showContacts && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-pink-500 border border-white shadow" /> Contacto
          </span>
        )}
        <span className="ml-auto flex items-center gap-3">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {vendors.length} vendedores</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {contacts.length} contactos</span>
        </span>
      </div>
    </div>
  );
}
