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
  html: `<div style="width:22px;height:22px;background:#123524;border:3px solid #C9F169;border-radius:50%;box-shadow:0 2px 8px rgba(16,36,26,0.28);"></div>`,
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
        <span className="text-sm font-semibold text-[#10241A]">Farm location</span>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={gpsLoading}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#E6EADF] bg-white px-3 py-1.5 text-xs font-semibold text-[#123524] hover:bg-[#F1F5EA] disabled:opacity-60"
        >
          {gpsLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <MapPin className="w-3.5 h-3.5" />
          )}
          Use current location
        </button>
      </div>

      <div className="z-0 h-56 w-full overflow-hidden rounded-2xl border border-[#E6EADF]">
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

      <p className="text-xs text-[#5C6B60]">
        Tap the map or drag the pin to set your farm&apos;s precise location.
      </p>

      {gpsError ? <p className="text-xs text-red-600">{gpsError}</p> : null}
      {boundsWarning ? <p className="text-xs text-amber-700">{boundsWarning}</p> : null}

      <div className="flex min-h-[2.5rem] items-center rounded-2xl bg-[#F6F7F2] px-3 py-2 text-sm">
        {geocoding ? (
          <span className="inline-flex items-center gap-2 text-[#5C6B60]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Resolving location…
          </span>
        ) : hasPin && value.location ? (
          <span className="text-[#10241A]">
            <span className="font-semibold">{value.location}</span>
            <span className="text-[#5C6B60]">
              {' '}
              · {value.latitude!.toFixed(4)}, {value.longitude!.toFixed(4)}
            </span>
          </span>
        ) : (
          <span className="text-[#5C6B60]">Pin your farm on the map</span>
        )}
      </div>
    </div>
  )
}
