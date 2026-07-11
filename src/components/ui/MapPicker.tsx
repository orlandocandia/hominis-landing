'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search, Loader2, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Default center: Lomas de Zamora (Agustina's office)
const DEFAULT_CENTER: [number, number] = [-34.7629, -58.4014];

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  address?: string;
}

function LocationMarker({ lat, lng, onChange }: { lat: number; lng: number; onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  const icon = L.divIcon({
    className: 'map-picker-marker',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#6366f1,#8b5cf6);transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">
      <div style="transform:rotate(45deg);width:14px;height:14px;background:white;border-radius:50%;"></div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
  return <Marker position={[lat, lng]} icon={icon} />;
}

export function MapPicker({ latitude, longitude, onChange, address }: MapPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchAddress, setSearchAddress] = useState(address || '');
  const [leafletReady, setLeafletReady] = useState(false);

  const center: [number, number] =
    latitude != null && longitude != null ? [latitude, longitude] : DEFAULT_CENTER;
  const hasMarker = latitude != null && longitude != null;

  useEffect(() => {
    setMounted(true);
    // Load leaflet CSS dynamically (same pattern as MapWithAgustina)
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

  const handleSearch = useCallback(async () => {
    if (!searchAddress.trim()) return;
    setSearching(true);
    try {
      const res = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: searchAddress }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange(data.latitude, data.longitude);
      toast.success('Ubicación encontrada');
    } catch (e: any) {
      toast.error(e.message || 'Dirección no encontrada');
    } finally {
      setSearching(false);
    }
  }, [searchAddress, onChange]);

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocalización no disponible');
      return;
    }
    setSearching(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setSearching(false);
        toast.success('Ubicación actual detectada');
      },
      () => {
        setSearching(false);
        toast.error('No se pudo obtener tu ubicación');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onChange]);

  if (!mounted || !leafletReady) {
    return (
      <div className="h-[300px] rounded-lg border bg-muted/30 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <Input
          placeholder="Buscar dirección... (ej: Portela 266, Lomas de Zamora)"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
          className="flex-1"
        />
        <Button type="button" size="icon" onClick={handleSearch} disabled={searching} variant="outline">
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
        <Button type="button" size="icon" onClick={handleGeolocate} disabled={searching} variant="outline" title="Mi ubicación">
          <Crosshair className="w-4 h-4" />
        </Button>
      </div>

      {/* Map */}
      <div className="h-[300px] rounded-lg border overflow-hidden">
        <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full" style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {hasMarker && <LocationMarker lat={latitude!} lng={longitude!} onChange={onChange} />}
          {!hasMarker && <LocationMarker lat={center[0]} lng={center[1]} onChange={onChange} />}
        </MapContainer>
      </div>

      {/* Coordinates */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="w-3 h-3" />
        {hasMarker ? (
          <span>Lat: {latitude!.toFixed(4)}, Lng: {longitude!.toFixed(4)} — Click en el mapa para mover</span>
        ) : (
          <span>Click en el mapa para setear ubicación</span>
        )}
      </div>
    </div>
  );
}
