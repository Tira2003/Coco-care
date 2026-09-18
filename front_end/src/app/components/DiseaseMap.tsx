import { useEffect, useMemo, useRef } from 'react'
import { Circle, CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { CircleMarker as LeafletCircleMarker } from 'leaflet'
import { getDistrictView } from '@/constants/districts'
import type { HeatmapPoint, NearbyResponse, ThreatLevel } from '@/types'

export function threatFromWeight(weight: number): ThreatLevel {
  if (weight >= 0.8) return 'critical'
  if (weight >= 0.7) return 'high'
  if (weight >= 0.6) return 'medium'
  return 'low'
}

export function threatColor(level: ThreatLevel) {
  if (level === 'critical') return '#B3261E'
  if (level === 'high') return '#E5484D'
  if (level === 'medium') return '#F5A524'
  return '#3DA35D'
}

export function pointKey(point: HeatmapPoint) {
  return `${point.farmId ?? point.reportId ?? ''}::${point.diseaseType}::${point.verificationStatus}::${point.createdAt ?? ''}`
}

function farmPinIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;background:#C9F169;border:3px solid #123524;border-radius:50%;box-shadow:0 2px 10px rgba(18,53,36,0.45);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
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
      const d = 0.018
      placed.push({
        ...point,
        lat: point.lat + d * Math.cos(angle),
        lng: point.lng + d * Math.sin(angle),
      })
    })
  }
  return placed
}

function flyToCoords(
  map: L.Map,
  coords: [number, number][],
  fallbackZoom: number,
) {
  if (coords.length === 0) return false
  if (coords.length === 1) {
    map.flyTo(coords[0]!, fallbackZoom, { duration: 0.7 })
    return true
  }
  map.flyToBounds(L.latLngBounds(coords), {
    padding: [48, 48],
    maxZoom: fallbackZoom,
    duration: 0.75,
  })
  return true
}

function MapViewport({
  points,
  focusedPoint,
  farms,
  selectedDistrict,
}: {
  points: HeatmapPoint[]
  focusedPoint: HeatmapPoint | null
  farms: NearbyResponse['farms']
  selectedDistrict?: string | null
}) {
  const map = useMap()

  useEffect(() => {
    if (focusedPoint) {
      map.flyTo([focusedPoint.lat, focusedPoint.lng], 12, { duration: 0.6 })
      return
    }

    if (selectedDistrict) {
      const districtPoints = points.map((point) => [point.lat, point.lng] as [number, number])
      if (flyToCoords(map, districtPoints, 12)) return
      const view = getDistrictView(selectedDistrict)
      if (view) {
        map.flyTo([view.lat, view.lng], view.zoom, { duration: 0.75 })
        return
      }
    }

    const coords: [number, number][] = [
      ...farms
        .filter((farm) => farm.lat != null && farm.lng != null)
        .map((farm) => [farm.lat!, farm.lng!] as [number, number]),
      ...points.map((point) => [point.lat, point.lng] as [number, number]),
    ]
    if (flyToCoords(map, coords, 10)) return
    map.setView([7.8731, 80.7718], 7)
  }, [focusedPoint, farms, points, selectedDistrict, map])

  return null
}

type OutbreakMarkerProps = {
  point: HeatmapPoint
  selected: boolean
  inWatchZone: boolean
  openPopup: boolean
  onSelect?: (point: HeatmapPoint) => void
}

function OutbreakMarker({ point, selected, inWatchZone, openPopup, onSelect }: OutbreakMarkerProps) {
  const markerRef = useRef<LeafletCircleMarker>(null)
  const level = point.threatLevel ?? threatFromWeight(point.weight)
  const color = threatColor(level)
  const radius = selected ? 16 : 9 + point.weight * 8

  useEffect(() => {
    if (openPopup) markerRef.current?.openPopup()
  }, [openPopup])

  return (
    <>
      <Circle
        center={[point.lat, point.lng]}
        radius={5000 + point.weight * 14000}
        pathOptions={{ color, fillColor: color, fillOpacity: selected ? 0.18 : 0.1, weight: 0 }}
      />
      <Circle
        center={[point.lat, point.lng]}
        radius={2200 + point.weight * 5000}
        pathOptions={{ color, fillColor: color, fillOpacity: selected ? 0.32 : 0.2, weight: 0 }}
      />
      <CircleMarker
        ref={markerRef}
        center={[point.lat, point.lng]}
        radius={radius}
        eventHandlers={{ click: () => onSelect?.(point) }}
        pathOptions={{
          color: inWatchZone ? '#123524' : color,
          fillColor: color,
          fillOpacity: 0.9,
          weight: selected || inWatchZone ? 4 : 2,
        }}
      >
        <Popup>
          <div className="min-w-[180px] space-y-1 text-sm">
            <div className="font-bold text-[#10241A]">{point.diseaseType}</div>
            <div className="text-[#5C6B60]">
              {point.farmName ? `${point.farmName} · ` : ''}
              {point.district ?? 'Sri Lanka'}
            </div>
            <div>
              Threat <b className="uppercase">{level}</b> · {Math.round(point.weight * 100)}% confidence
            </div>
            <div>
              {point.verificationStatus === 'ai_suspected'
                ? 'AI-suspected — not officer verified'
                : 'Officer/admin verified'}
            </div>
            {(point.count ?? 1) > 1 ? <div>{point.count} reports at this grove</div> : null}
            {inWatchZone ? (
              <div className="font-semibold text-[#B3261E]">Inside your 25 km warning radius</div>
            ) : null}
          </div>
        </Popup>
      </CircleMarker>
    </>
  )
}

type DiseaseMapProps = {
  points: HeatmapPoint[]
  focusedPoint?: HeatmapPoint | null
  farms?: NearbyResponse['farms']
  radiusKm?: number
  nearbyReportIds?: Set<string>
  nearbyClusterKeys?: Set<string>
  selectedDistrict?: string | null
  onSelectPoint?: (point: HeatmapPoint) => void
}

export function DiseaseMap({
  points,
  focusedPoint = null,
  farms = [],
  radiusKm = 25,
  nearbyReportIds,
  nearbyClusterKeys,
  selectedDistrict = null,
  onSelectPoint,
}: DiseaseMapProps) {
  const focusedKey = focusedPoint ? pointKey(focusedPoint) : null
  const displayPoints = useMemo(() => offsetOverlapping(points), [points])

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <MapContainer
        center={[7.8731, 80.7718]}
        zoom={7}
        scrollWheelZoom
        className="z-0 h-[320px] w-full sm:h-[540px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapViewport
          points={displayPoints}
          focusedPoint={focusedPoint}
          farms={farms}
          selectedDistrict={selectedDistrict}
        />

        {farms.map((farm) =>
          farm.lat != null && farm.lng != null ? (
            <Circle
              key={`zone-${farm.farmId}`}
              center={[farm.lat, farm.lng]}
              radius={radiusKm * 1000}
              pathOptions={{
                color: '#123524',
                weight: 2,
                dashArray: '8 10',
                fillColor: '#C9F169',
                fillOpacity: 0.08,
              }}
            />
          ) : null,
        )}

        {displayPoints.map((point) => {
          const key = pointKey(point)
          return (
            <OutbreakMarker
              key={key}
              point={point}
              selected={key === focusedKey}
              inWatchZone={
                Boolean(point.reportId && nearbyReportIds?.has(point.reportId)) ||
                Boolean(nearbyClusterKeys?.has(`${point.farmId ?? ''}:${point.diseaseType}`))
              }
              openPopup={key === focusedKey}
              onSelect={onSelectPoint}
            />
          )
        })}

        {farms.map((farm) =>
          farm.lat != null && farm.lng != null ? (
            <Marker key={farm.farmId} position={[farm.lat, farm.lng]} icon={farmPinIcon()}>
              <Popup>
                <div className="text-sm">
                  <b>{farm.farmName}</b>
                  <div className="text-[#5C6B60]">{radiusKm} km disease watch zone</div>
                </div>
              </Popup>
            </Marker>
          ) : null,
        )}
      </MapContainer>

      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-[10px] font-semibold text-[#10241A] shadow-md sm:text-[11px]">
        <span className="flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-[#B3261E]" />
          Critical
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-[#E5484D]" />
          High
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-[#F5A524]" />
          Medium
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-[#3DA35D]" />
          Low
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full border-2 border-dashed border-[#123524] bg-[#C9F169]/70" />
          {radiusKm} km warning
        </span>
      </div>
    </div>
  )
}
