import { SRI_LANKA_DISTRICTS } from '@/constants/districts'

type NominatimAddress = {
  state?: string
  state_district?: string
  county?: string
  city?: string
  town?: string
  village?: string
  suburb?: string
  neighbourhood?: string
}

type NominatimResponse = {
  display_name?: string
  address?: NominatimAddress
}

function matchDistrict(text: string): string | undefined {
  const lower = text.toLowerCase()
  return SRI_LANKA_DISTRICTS.find((d) => lower.includes(d.toLowerCase()))
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lng))
  url.searchParams.set('format', 'json')

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error('Could not resolve location name')
  }

  const data = (await res.json()) as NominatimResponse
  const addr = data.address ?? {}

  const candidates = [
    addr.state_district,
    addr.state,
    addr.county,
    addr.city,
    addr.town,
    addr.village,
    addr.suburb,
    data.display_name,
  ].filter(Boolean) as string[]

  for (const candidate of candidates) {
    const district = matchDistrict(candidate)
    if (district) return district
  }

  const locality =
    addr.village ?? addr.town ?? addr.city ?? addr.suburb ?? addr.neighbourhood
  if (locality) return locality

  if (data.display_name) {
    const part = data.display_name.split(',')[0]?.trim()
    if (part) return part
  }

  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
}

export function isWithinSriLanka(lat: number, lng: number): boolean {
  return lat >= 5.9 && lat <= 9.9 && lng >= 79.6 && lng <= 82.0
}
