import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import type { DragEndEvent } from 'leaflet'
import { Loader2, MapPin } from 'lucide-react'
import { isWithinSriLanka, reverseGeocode } from '@/utils/reverseGeocode'

export type FarmLocationValue = {
  latitude: number | null
  longitude: number | null
  location: string
}

const DEFAULT_CENTER: [number, number] = [7.8731, 80.7718]
const DEFAULT_ZOOM = 7
const PIN_ZOOM = 14

const farmPinIcon = L.divIcon({
  className: '',
  html: `<div style="width:22px;height:22px;background:#2d5f2e;border:3px solid #1a2e1a;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

type FarmLocationPickerProps = {
  value: FarmLocationValue
  onChange: (value: FarmLocationValue) => void
}

function MapFlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.6 })
  }, [center, zoom, map])

  return null
}

function MapClickHandler({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function DraggablePin({
  position,
  onDragEnd,
}: {
  position: [number, number]
  onDragEnd: (lat: number, lng: number) => void
}) {
  return (
    <Marker
      position={position}
      icon={farmPinIcon}
      draggable
      eventHandlers={{
        dragend(e: DragEndEvent) {
          const { lat, lng } = e.target.getLatLng()
          onDragEnd(lat, lng)
        },
      }}
    />
  )
}

export function FarmLocationPicker({ value, onChange }: FarmLocationPickerProps) {
  const [flyTarget, setFlyTarget] = useState<{ center: [number, number]; zoom: number } | null>(
    null,
  )
  const [gpsLoading, setGpsLoading] = useState(false)
  const [geocoding, setGeocoding] = useState(false)
  const [gpsError, setGpsError] = useState('')
  const [boundsWarning, setBoundsWarning] = useState('')
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasPin = value.latitude !== null && value.longitude !== null
  const pinPosition: [number, number] | null = hasPin
    ? [value.latitude!, value.longitude!]
    : null

  const setCoordinates = useCallback(
    (lat: number, lng: number) => {
      setBoundsWarning(
        isWithinSriLanka(lat, lng)
          ? ''
          : 'This point appears outside Sri Lanka. You can still save if correct.',
      )
      onChange({ latitude: lat, longitude: lng, location: '' })
      setFlyTarget({ center: [lat, lng], zoom: PIN_ZOOM })
    },
    [onChange],
  )

  useEffect(() => {
    if (value.latitude === null || value.longitude === null) return

    if (geocodeTimer.current) clearTimeout(geocodeTimer.current)

    geocodeTimer.current = setTimeout(async () => {
      setGeocoding(true)
      try {
        const label = await reverseGeocode(value.latitude!, value.longitude!)
        onChange({
          latitude: value.latitude,
          longitude: value.longitude,
          location: label,
        })
      } catch {
        onChange({
          latitude: value.latitude,
          longitude: value.longitude,
          location: `${value.latitude!.toFixed(4)}, ${value.longitude!.toFixed(4)}`,
        })
      } finally {
        setGeocoding(false)
      }
    }, 400)

    return () => {
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current)
    }
  }, [value.latitude, value.longitude])

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported on this device.')
      return
    }

    setGpsError('')
    setGpsLoading(true)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false)
        setCoordinates(pos.coords.latitude, pos.coords.longitude)
      },
      (err) => {
        setGpsLoading(false)
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location permission denied. Allow access or pin manually on the map.')
        } else {
          setGpsError('Could not get your location. Pin your farm on the map instead.')
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-gray-600">Farm location</span>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={gpsLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#2d5f2e] border border-[#2d5f2e]/40 rounded-lg hover:bg-green-50 disabled:opacity-60 transition-colors"
        >
          {gpsLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <MapPin className="w-3.5 h-3.5" />
          )}
          Use current location
        </button>
      </div>

      <div className="h-56 w-full rounded-xl overflow-hidden border border-gray-200 z-0">
        <MapContainer
          center={pinPosition ?? DEFAULT_CENTER}
          zoom={hasPin ? PIN_ZOOM : DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onSelect={setCoordinates} />
          {flyTarget ? <MapFlyTo center={flyTarget.center} zoom={flyTarget.zoom} /> : null}
          {pinPosition ? (
            <DraggablePin position={pinPosition} onDragEnd={setCoordinates} />
          ) : null}
        </MapContainer>
      </div>

      <p className="text-xs text-gray-500">
        Tap the map or drag the pin to set your farm&apos;s precise location.
      </p>

      {gpsError ? <p className="text-xs text-red-600">{gpsError}</p> : null}
      {boundsWarning ? <p className="text-xs text-amber-700">{boundsWarning}</p> : null}

      <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm min-h-[2.5rem] flex items-center">
        {geocoding ? (
          <span className="inline-flex items-center gap-2 text-gray-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Resolving location…
          </span>
        ) : hasPin && value.location ? (
          <span className="text-gray-800">
            <span className="font-medium">{value.location}</span>
            <span className="text-gray-500">
              {' '}
              · {value.latitude!.toFixed(4)}, {value.longitude!.toFixed(4)}
            </span>
          </span>
        ) : (
          <span className="text-gray-400">Pin your farm on the map</span>
        )}
      </div>
    </div>
  )
}
