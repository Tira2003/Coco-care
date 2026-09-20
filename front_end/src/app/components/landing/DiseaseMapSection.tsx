import { useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { diseaseMapApi } from '@/api/services'
import type { HeatmapPoint } from '@/types'

const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718]
const SRI_LANKA_BOUNDS: L.LatLngBoundsExpression = [
  [5.85, 79.52],
  [9.88, 82.0],
]

const STATUS_COLORS: Record<HeatmapPoint['verificationStatus'], string> = {
  verified: '#E5484D',
  ai_suspected: '#F5A524',
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function offsetOverlapping(points: HeatmapPoint[]) {
  const groups = new Map<string, HeatmapPoint[]>()
  for (const point of points) {
    const key = `${point.lat.toFixed(4)}:${point.lng.toFixed(4)}`
    const list = groups.get(key) ?? []
    list.push(point)
    groups.set(key, list)
  }

  const placed: HeatmapPoint[] = []
  for (const group of groups.values()) {
    if (group.length === 1) {
      placed.push(group[0]!)
      continue
    }
    group.forEach((point, index) => {
      const angle = (2 * Math.PI * index) / group.length
      const d = 0.04
      placed.push({
        ...point,
        lat: point.lat + d * Math.cos(angle),
        lng: point.lng + d * Math.sin(angle),
      })
    })
  }
  return placed
}

function DiseaseLeafletMap({ points }: { points: HeatmapPoint[] }) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const displayPoints = useMemo(() => offsetOverlapping(points), [points])

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
      maxBounds: SRI_LANKA_BOUNDS,
      maxBoundsViscosity: 0.85,
      minZoom: 7,
      maxZoom: 14,
    }).setView(SRI_LANKA_CENTER, 7)

    mapInstanceRef.current = map
    markersRef.current = L.layerGroup().addTo(map)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map)

    map.on('click', () => map.scrollWheelZoom.enable())

    const invalidate = () => map.invalidateSize()
    window.addEventListener('resize', invalidate)
    const sizeTimer = window.setTimeout(invalidate, 80)

    return () => {
      window.removeEventListener('resize', invalidate)
      window.clearTimeout(sizeTimer)
      map.remove()
      mapInstanceRef.current = null
      markersRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    const markers = markersRef.current
    if (!map || !markers) return

    markers.clearLayers()

    for (const point of displayPoints) {
      const status = point.verificationStatus
      const color = STATUS_COLORS[status]
      const count = point.count ?? 1
      const radius = Math.min(22, 10 + count * 2)
      const label = status === 'verified' ? 'Verified outbreak' : 'Suspected'
      const district = escapeHtml(point.district || 'Sri Lanka')
      const disease = escapeHtml(point.diseaseType)
      const reports = count === 1 ? '1 farmer report' : `${count} farmer reports`

      L.circleMarker([point.lat, point.lng], {
        radius,
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.38,
      })
        .addTo(markers)
        .bindPopup(
          `<div style="font-family:'Inter',sans-serif;font-size:13px;line-height:1.45;min-width:160px;">
            <b style="color:#10241A;font-size:14px;">${disease}</b><br>
            <span style="color:#5C6B60;">${district} · ${reports}</span><br>
            <span style="color:${color};font-weight:700;text-transform:uppercase;font-size:11px;letter-spacing:0.06em;display:inline-block;margin-top:4px;">
              ${label}
            </span>
          </div>`,
        )
    }

    if (displayPoints.length === 0) {
      map.setView(SRI_LANKA_CENTER, 7)
    }
  }, [displayPoints])

  return <div ref={mapContainerRef} className="h-[460px] w-full rounded-2xl overflow-hidden filter saturate-[.95]" />
}

export function DiseaseMapSection() {
  const { data: points = [], isLoading, isError } = useQuery({
    queryKey: ['disease-map', 'public'],
    queryFn: diseaseMapApi.publicHeatmap,
    refetchInterval: 5 * 60 * 1000,
  })

  const verifiedCount = points.filter((point) => point.verificationStatus === 'verified').length
  const suspectedCount = points.length - verifiedCount

  return (
    <section className="py-20 sm:py-24 bg-[#123524] text-white" id="map">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-9">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C9F169] mb-3">
              <span className="w-2 h-2 rounded-full bg-[#C9F169]" />
              Live Disease Heatmap
            </span>
            <h2 className="font-['Bricolage_Grotesque',sans-serif] text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-3">
              See outbreaks before
              <br />
              they reach your gate
            </h2>
            <p className="text-[#AEC0A6] text-base max-w-xl leading-relaxed">
              Real coconut disease reports from Coco Care farmers, mapped across Sri Lanka. Drag,
              zoom, and tap a marker.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-bold bg-[#C9F169]/15 border border-[#C9F169]/30 text-[#C9F169] px-4 py-2 rounded-full self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#C9F169] animate-ping" />
            {isLoading
              ? 'Loading farmer reports'
              : `${points.length} outbreak${points.length === 1 ? '' : 's'} · live`}
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0C281B]">
          <DiseaseLeafletMap points={points} />

          {isLoading ? (
            <div className="absolute inset-0 z-[400] flex items-center justify-center bg-[#0C281B]/40 text-sm font-semibold text-white">
              Loading Sri Lanka outbreak map…
            </div>
          ) : null}

          {!isLoading && points.length === 0 ? (
            <div className="pointer-events-none absolute inset-x-0 top-4 z-[400] flex justify-center px-4">
              <p className="rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-[#10241A] shadow-md">
                {isError
                  ? 'Could not load farmer outbreak reports.'
                  : 'No farmer-reported coconut outbreaks are mapped yet.'}
              </p>
            </div>
          ) : null}

          <div className="absolute left-4 bottom-4 z-[500] bg-white/95 backdrop-blur-md rounded-xl px-4 py-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#10241A] shadow-md">
            <span className="flex items-center gap-2">
              <i className="w-2.5 h-2.5 rounded-full bg-[#E5484D]" />
              Verified outbreak{verifiedCount ? ` · ${verifiedCount}` : ''}
            </span>
            <span className="flex items-center gap-2">
              <i className="w-2.5 h-2.5 rounded-full bg-[#F5A524]" />
              Suspected{suspectedCount ? ` · ${suspectedCount}` : ''}
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs sm:text-sm text-[#8FA68B]">
          Markers are farmer diagnoses from groves in Sri Lanka. Red is officer-verified; amber is
          still under review.
        </p>
      </div>
    </section>
  )
}
