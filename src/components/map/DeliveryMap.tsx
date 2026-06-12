"use client"

import { useEffect, useRef } from "react"

interface Position {
  lat: number
  lng: number
}

interface DeliveryMapProps {
  position: Position | null
  className?: string
}

export default function DeliveryMap({ position, className }: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null)
  const markerRef = useRef<import("leaflet").Marker | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    let map: import("leaflet").Map
    let marker: import("leaflet").Marker

    const initMap = async () => {
      const L = (await import("leaflet")).default

      // Corrige os ícones quebrados do Leaflet no Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      const defaultCenter: [number, number] = [-23.5505, -46.6333] // São Paulo

      map = L.map(mapRef.current!, {
        center: position ? [position.lat, position.lng] : defaultCenter,
        zoom: position ? 16 : 12,
        zoomControl: true,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      if (position) {
        marker = L.marker([position.lat, position.lng]).addTo(map)
        markerRef.current = marker
      }

      mapInstanceRef.current = map
    }

    initMap()

    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }, []) // só inicializa uma vez

  useEffect(() => {
    if (!position || !mapInstanceRef.current) return

    const updateMarker = async () => {
      const L = (await import("leaflet")).default
      const map = mapInstanceRef.current!
      const newLatLng = L.latLng(position.lat, position.lng)

      if (markerRef.current) {
        // Animação suave — sem teleporte
        animateMarker(markerRef.current, newLatLng)
      } else {
        markerRef.current = L.marker(newLatLng).addTo(map)
      }

      map.panTo(newLatLng, { animate: true, duration: 0.8 })
    }

    updateMarker()
  }, [position])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={mapRef} className={className ?? "h-full w-full"} />
    </>
  )
}

function animateMarker(
  marker: import("leaflet").Marker,
  destination: import("leaflet").LatLng,
  steps = 30,
  intervalMs = 20
) {
  const start = marker.getLatLng()
  const deltaLat = (destination.lat - start.lat) / steps
  const deltaLng = (destination.lng - start.lng) / steps
  let step = 0

  const interval = setInterval(() => {
    step++
    if (step >= steps) {
      marker.setLatLng(destination)
      clearInterval(interval)
      return
    }
    marker.setLatLng([start.lat + deltaLat * step, start.lng + deltaLng * step])
  }, intervalMs)
}
