"use client"

import dynamic from "next/dynamic"
import colegiosData from "../public/colegios.json"
import { useState, useMemo } from "react"

const Map = dynamic(() => import("./components/Map"), { ssr: false })

interface Colegio {
  id: number
  nombre: string
  codigo_dane: string
  direccion: string
  barrio: string
  lat: number
  lng: number
}

export default function Home() {
  const colegios = colegiosData as Colegio[]

  const [busqueda, setBusqueda] = useState("")
  const [barrioSeleccionado, setBarrioSeleccionado] = useState("Todos")
  const [colegioSeleccionado, setColegioSeleccionado] = useState<Colegio | null>(null)
  const [resetView, setResetView] = useState(0)

  const barrios = useMemo(() => {
    const lista = colegios.map(c => c.barrio)
    return ["Todos", ...Array.from(new Set(lista)).sort()]
  }, [colegios])

  const colegiosFiltrados = useMemo(() => {
    return colegios.filter(colegio => {
      const coincideBarrio =
        barrioSeleccionado === "Todos" || colegio.barrio === barrioSeleccionado

      const coincideNombre =
        busqueda === "" ||
        colegio.nombre.toLowerCase().includes(busqueda.toLowerCase())

      return coincideBarrio && coincideNombre
    })
  }, [busqueda, barrioSeleccionado, colegios])

  const sugerencias = useMemo(() => {
    if (busqueda.length === 0) return []
    return colegiosFiltrados.slice(0, 8)
  }, [busqueda, colegiosFiltrados])

  function seleccionarColegio(colegio: Colegio) {
    setColegioSeleccionado(colegio)
    setBusqueda(colegio.nombre)
  }

  function resetearVista() {
    setBusqueda("")
    setBarrioSeleccionado("Todos")
    setColegioSeleccionado(null)
    setResetView(prev => prev + 1)
  }

  return (
    <main className="w-full h-screen relative overflow-hidden">

      {/* MAPA FULLSCREEN */}
      <div className="absolute inset-0 z-0">
        <Map
          colegios={colegiosFiltrados}
          colegioSeleccionado={colegioSeleccionado}
          resetView={resetView}
        />
      </div>

      {/* CAPA SUPERIOR */}
      <div className="relative z-10">

        {/* HEADER */}
        <div className="bg-blue-700 text-white text-center py-6 shadow-lg">
          <h1 className="text-3xl font-bold">GeoCol - Mapa Educativo de Santander</h1>
          <p className="text-sm opacity-90">
            Explorando los colegios públicos de Bucaramanga
          </p>
        </div>

        {/* 🔵 NUEVO PANEL HORIZONTAL */}
        <div className="max-w-5xl mx-auto mt-6 px-6">
          <div className="flex gap-3 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-2xl">

            {/* SELECT BARRIO */}
            <select
              value={barrioSeleccionado}
              onChange={e => setBarrioSeleccionado(e.target.value)}
              className="p-3 rounded-lg border bg-white w-64"
            >
              {barrios.map(b => (
                <option key={b}>{b}</option>
              ))}
            </select>

            {/* BUSCADOR */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar colegio por nombre..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full p-3 rounded-lg border bg-white"
              />

              {sugerencias.length > 0 && (
                <div className="absolute w-full bg-white shadow-xl rounded-lg mt-1 max-h-60 overflow-y-auto z-20">
                  {sugerencias.map(colegio => (
                    <div
                      key={colegio.id}
                      onClick={() => seleccionarColegio(colegio)}
                      className="p-3 hover:bg-blue-100 cursor-pointer border-b last:border-none"
                    >
                      {colegio.nombre}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BOTON RESET */}
            <button
              onClick={resetearVista}
              className="bg-blue-600 text-white px-6 rounded-lg shadow-xl hover:bg-blue-700 transition whitespace-nowrap"
            >
              Volver a todos
            </button>

          </div>
        </div>

        {/* CONTADOR */}
        <div className="absolute right-6 top-36 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-xl">
          📍 {colegiosFiltrados.length} colegios
        </div>

      </div>
    </main>
  )
}
