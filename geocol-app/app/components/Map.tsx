'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix iconos Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Colegio {
  nombre: string;
  codigo_dane: string;
  direccion: string;
  barrio: string;
  lat: number;
  lng: number;
}

interface MapProps {
  colegios: Colegio[];
  colegioSeleccionado: Colegio | null;
  resetView?: number;
}

export default function Map({ colegios, colegioSeleccionado, resetView }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([7.1193, -73.1227], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(marker => mapRef.current!.removeLayer(marker));
    markersRef.current = [];

    colegios.forEach(colegio => {
      const marker = L.marker([colegio.lat, colegio.lng]).addTo(mapRef.current!);
      marker.bindPopup(`<b>${colegio.nombre}</b><br/>${colegio.barrio}`);
      markersRef.current.push(marker);
    });
  }, [colegios]);

  useEffect(() => {
    if (!mapRef.current || !colegioSeleccionado) return;
    mapRef.current.setView([colegioSeleccionado.lat, colegioSeleccionado.lng], 16);
  }, [colegioSeleccionado]);

  useEffect(() => {
    if (!mapRef.current || !resetView) return;
    mapRef.current.setView([7.1193, -73.1227], 12);
  }, [resetView]);

  // 🔥 CAMBIO APLICADO: mapa ocupa toda la pantalla real
  return (
    <div
      ref={mapContainerRef}
      className="absolute inset-0"
      style={{ zIndex: 0 }}
    />
  );
}
