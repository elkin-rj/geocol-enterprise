'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-[calc(100vh-80px)] rounded-lg shadow-lg bg-gray-100">
      <p className="text-gray-600 text-lg">Cargando mapa...</p>
    </div>
  ),
});

interface Colegio {
  id?: number;
  nombre: string;
  codigo_dane: string;
  direccion: string;
  barrio: string;
  lat: number;
  lng: number;
}

export default function Home() {
  const [colegios, setColegios] = useState<Colegio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [barrioSeleccionado, setBarrioSeleccionado] = useState<string>('');
  const [colegioSeleccionado, setColegioSeleccionado] = useState<Colegio | null>(null);
  const [resetView, setResetView] = useState(0);
  const [mostrarResultados, setMostrarResultados] = useState(true);

  useEffect(() => {
    async function getColegios() {
      try {
        const res = await fetch('/colegios.json');
        if (!res.ok) {
          throw new Error('Failed to fetch colegios');
        }
        const data = await res.json();
        setColegios(data);
      } catch (error) {
        console.error('Error loading colegios:', error);
        setColegios([]);
      } finally {
        setLoading(false);
      }
    }

    getColegios();
  }, []);

  const barrios = useMemo(() => {
    const barriosUnicos = Array.from(new Set(colegios.map((c) => c.barrio)))
      .filter((b) => b && b !== 'Sin información')
      .sort();
    return barriosUnicos;
  }, [colegios]);

  // Filtrar colegios según la búsqueda
  const colegiosFiltrados = useMemo(() => {
    let resultado = colegios;

    if (barrioSeleccionado) {
      resultado = resultado.filter((c) => c.barrio === barrioSeleccionado);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      resultado = resultado.filter((c) => c.nombre.toLowerCase().includes(query));
    }

    return resultado;
  }, [colegios, searchQuery, barrioSeleccionado]);

  // Resetear mapa automáticamente cuando searchQuery queda vacío
  useEffect(() => {
    if (searchQuery === '') {
      // Si el input está vacío, resetear a vista completa
      setColegioSeleccionado(null);
      setMostrarResultados(true);
      setResetView((prev) => prev + 1); // Trigger reset del mapa
    }
  }, [searchQuery]);

  const handleColegioClick = (colegio: Colegio) => {
    setColegioSeleccionado(colegio);
    setMostrarResultados(false); // Ocultar la lista al seleccionar
    // NO limpiar searchQuery para mantener los botones visibles
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setColegioSeleccionado(null);
    setMostrarResultados(true); // Resetear para mostrar lista en próxima búsqueda
    setResetView((prev) => prev + 1); // Trigger reset del mapa
  };

  const handleResetView = () => {
    setSearchQuery('');
    setBarrioSeleccionado('');
    setColegioSeleccionado(null);
    setMostrarResultados(true); // Resetear para mostrar lista en próxima búsqueda
    setResetView((prev) => prev + 1); // Trigger reset del mapa
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setMostrarResultados(true); // Mostrar lista cuando se escribe
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            GeoCol - Mapa Educativo de Santander
          </h1>
          <p className="text-center mt-2 text-blue-100 text-sm md:text-base">
            Explorando los colegios públicos de Bucaramanga
          </p>
        </div>
      </header>

      {/* Mapa */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center w-full h-[calc(100vh-80px)] rounded-lg shadow-lg bg-gray-100">
            <p className="text-gray-600 text-lg">Cargando datos...</p>
          </div>
        ) : (
          <div className="relative w-full h-[calc(100vh-80px)]">
            {/* Contador de colegios - Esquina superior derecha */}
            <div className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <span className="text-xl">📍</span>
              <span className="font-semibold">
                {colegiosFiltrados.length} {colegiosFiltrados.length === 1 ? 'colegio' : 'colegios'}
                {barrioSeleccionado && ` en ${barrioSeleccionado}`}
              </span>
            </div>

            {/* Barra de búsqueda */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-md px-4">
              <div className="relative">
                <select
                  value={barrioSeleccionado}
                  onChange={(e) => setBarrioSeleccionado(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg shadow-xl bg-white border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 text-gray-700 font-medium"
                >
                  <option value="">📍 Todos los barrios ({colegios.length} colegios)</option>
                  {barrios.map((barrio) => {
                    const count = colegios.filter((c) => c.barrio === barrio).length;
                    return (
                      <option key={barrio} value={barrio}>
                        {barrio} ({count} {count === 1 ? 'colegio' : 'colegios'})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="relative mt-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Buscar colegio por nombre..."
                  className="w-full px-4 py-3 pr-12 rounded-lg shadow-xl bg-white border-2 border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                />
                {searchQuery.length > 0 && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center"
                    aria-label="Limpiar búsqueda"
                    title="Limpiar búsqueda"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Lista de resultados */}
              {searchQuery && mostrarResultados && colegiosFiltrados.length > 0 && (
                <div className="mt-2 bg-white rounded-lg shadow-xl border-2 border-blue-500 max-h-64 overflow-y-auto">
                  {colegiosFiltrados.map((colegio) => (
                    <button
                      key={colegio.id || colegio.codigo_dane}
                      onClick={() => handleColegioClick(colegio)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{colegio.nombre}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        📍 {colegio.barrio} • {colegio.direccion}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Mensaje cuando no hay resultados */}
              {searchQuery && mostrarResultados && colegiosFiltrados.length === 0 && (
                <div className="mt-2 bg-white rounded-lg shadow-xl border-2 border-blue-500 px-4 py-3 text-center text-gray-500">
                  No se encontraron colegios con ese nombre
                </div>
              )}

              {/* Botón Ver todos los colegios - Siempre visible cuando hay búsqueda */}
              {(searchQuery || barrioSeleccionado) && (
                <button
                  onClick={handleResetView}
                  className="mt-2 w-full bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg shadow-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <span>🗺️</span>
                  <span>Ver todos los colegios</span>
                </button>
              )}
            </div>

            {/* Mapa */}
            <Map
              colegios={colegiosFiltrados}
              colegioSeleccionado={colegioSeleccionado}
              resetView={resetView}
            />
          </div>
        )}
      </main>
    </div>
  );
}
