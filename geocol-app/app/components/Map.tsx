'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para iconos de Leaflet en Next.js
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

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Inicializar mapa centrado en Bucaramanga
    const map = L.map(mapContainerRef.current).setView([7.1193, -73.1227], 13);

    // Agregar capa de tiles (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Actualizar marcadores cuando cambian los colegios filtrados
  useEffect(() => {
    if (!mapRef.current) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Agregar marcadores para cada colegio filtrado
    colegios.forEach((colegio) => {
      const marker = L.marker([colegio.lat, colegio.lng]).addTo(mapRef.current!);

      // Crear popup con información del colegio
      const popupContent = `
        <div style="min-width: 200px; padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 14px; color: #1f2937;">
            ${colegio.nombre}
          </h3>
          <p style="margin: 4px 0; font-size: 12px; color: #4b5563;">
            <strong>Código DANE:</strong> ${colegio.codigo_dane}
          </p>
          <p style="margin: 4px 0; font-size: 12px; color: #4b5563;">
            <strong>Dirección:</strong> ${colegio.direccion}
          </p>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersRef.current.push(marker);
    });
  }, [colegios]);

  // Centrar mapa en colegio seleccionado
  useEffect(() => {
    if (!mapRef.current || !colegioSeleccionado) return;

    const { lat, lng } = colegioSeleccionado;
    mapRef.current.setView([lat, lng], 16, {
      animate: true,
      duration: 0.5,
    });

    // Abrir popup del marcador seleccionado
    const marker = markersRef.current.find(
      (m) => m.getLatLng().lat === lat && m.getLatLng().lng === lng
    );
    if (marker) {
      marker.openPopup();
    }
  }, [colegioSeleccionado]);

  // Resetear vista del mapa a la posición inicial
  useEffect(() => {
    if (!mapRef.current || resetView === 0) return;

    // Cerrar todos los popups
    markersRef.current.forEach((marker) => {
      marker.closePopup();
    });

    // Volver a centrar en Bucaramanga con zoom inicial
    mapRef.current.setView([7.1193, -73.1227], 12, {
      animate: true,
      duration: 0.5,
    });
  }, [resetView]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[calc(100vh-80px)] rounded-lg shadow-lg"
      style={{ zIndex: 0 }}
    />
  );
}

