'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { Loader2, MapPin, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Contact {
  id: string;
  name: string;
  address: string;
  city: string | null;
  status: string;
  latitude: number;
  longitude: number;
}

const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export default function MapaContactosPage() {
  const mounted = useIsMounted();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [leafletReady, setLeafletReady] = useState(false);

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
    fetch('/api/crm/contacts?limit=500')
      .then(r => r.json())
      .then(d => setContacts((d.contacts || []).filter((c: Contact) => c.latitude != null && c.longitude != null)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const center: [number, number] = contacts.length > 0 ? [contacts[0].latitude, contacts[0].longitude] : [-34.7629, -58.4014];

  const icon = L.divIcon({
    className: 'contact-map-marker',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#ec4899,#8b5cf6);transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">
      <div style="transform:rotate(45deg);width:12px;height:12px;background:white;border-radius:50%;"></div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

  if (!mounted || !leafletReady || loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mapa de mi cartera</h1>
        <p className="text-sm text-muted-foreground">{contacts.length} contactos geolocalizados</p>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay contactos con ubicación cargada.</p>
            <Link href="/vendedor/contactos/nuevo" className="text-primary hover:underline text-sm mt-2 inline-block">
              Crear un contacto con dirección
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="h-[500px] rounded-lg border overflow-hidden">
            <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full" style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {contacts.map((c) => (
                <Marker key={c.id} position={[c.latitude, c.longitude]} icon={icon}>
                  <Popup>
                    <div className="min-w-[180px]">
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-gray-600">{c.address}</p>
                      {c.city && <p className="text-xs text-gray-600">{c.city}</p>}
                      <div className="mt-1">
                        <Badge variant="secondary" className="text-[10px]">{c.status}</Badge>
                      </div>
                      <Link href={`/vendedor/contactos/${c.id}`} className="text-blue-600 text-xs hover:underline mt-2 inline-block">
                        Ver detalle →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Legend */}
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Hacé clic en un marcador para ver el detalle del contacto. El mapa cubre todos tus contactos con dirección geocodificada.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
