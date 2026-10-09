'use client'

import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import type { LatLngTuple } from 'leaflet'

type Facility = {
  id: string
  name: string
  state: string
  lga: string
  lat: number
  lon: number
  pop: number
  score: number
  status: string
  shortItems: { item: string; daysOut: number }[]
}

const colors: Record<string, string> = {
  Ready: '#3f9a68',
  'At risk': '#e7a23b',
  'Not ready': '#d96857',
  'Unknown (silent)': '#9aa7a2',
}

function MapController({
  facilities,
  state,
  lga,
}: {
  facilities: Facility[]
  state: string
  lga: string
}) {
  const map = useMap()

  // Invalidate size after first render
  useEffect(() => {
    map.invalidateSize()
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 150)
    return () => clearTimeout(timer)
  }, [map])

  // Invalidate size whenever container is resized
  useEffect(() => {
    const container = map.getContainer()
    if (!container || typeof ResizeObserver === 'undefined') return
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [map])

  // Invalidate size and fit bounds whenever state/LGA filters change
  useEffect(() => {
    map.invalidateSize()

    if (facilities.length === 0) return

    if (state && state !== 'All states') {
      const bounds = facilities.map((p) => [p.lat, p.lon] as LatLngTuple)
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: lga !== 'All LGAs' ? 12 : 9 })
    } else {
      const bounds = facilities.map((p) => [p.lat, p.lon] as LatLngTuple)
      map.fitBounds(bounds, { padding: [24, 24] })
    }
  }, [map, state, lga, facilities])

  return null
}

export default function ReadinessMap({
  facilities,
  selected,
  onSelect,
  state = 'All states',
  lga = 'All LGAs',
}: {
  facilities: Facility[]
  selected: Facility | null
  onSelect: (f: Facility) => void
  state?: string
  lga?: string
}) {
  const baseRadius = 5.5

  return (
    <MapContainer
      center={[9.2, 7.5]}
      zoom={6}
      scrollWheelZoom={false}
      zoomControl={true}
      preferCanvas={true}
      className="h-[420px] md:h-[560px] w-full"
      style={{ height: '100%', width: '100%', minHeight: '420px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController facilities={facilities} state={state} lga={lga} />
      {facilities.map((f) => {
        const isSelected = selected?.id === f.id
        const color = colors[f.status] || '#9aa7a2'
        return (
          <CircleMarker
            key={f.id}
            center={[f.lat, f.lon]}
            radius={isSelected ? 10 : baseRadius}
            pathOptions={{
              color: isSelected ? '#173d3b' : color,
              fillColor: color,
              fillOpacity: 0.85,
              weight: isSelected ? 2.5 : 1.5,
            }}
            eventHandlers={{
              click: () => onSelect(f),
            }}
          >
            <Popup>
              <strong>{f.name}</strong>
              <br />
              {f.lga}, {f.state}
              <br />
              Readiness score: {Math.round(f.score * 100)}%
              {f.state === 'Lagos' && (
                <>
                  <br />
                  Simulated location.
                </>
              )}
            </Popup>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
