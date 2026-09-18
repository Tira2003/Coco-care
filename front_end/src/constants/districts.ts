export const SRI_LANKA_DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Galle',
  'Matara',
  'Hambantota',
  'Kurunegala',
  'Puttalam',
] as const

export type SriLankaDistrict = (typeof SRI_LANKA_DISTRICTS)[number]

export type DistrictView = {
  lat: number
  lng: number
  zoom: number
}

export const SRI_LANKA_DISTRICT_VIEWS: Record<string, DistrictView> = {
  Colombo: { lat: 6.9271, lng: 79.8612, zoom: 11 },
  Gampaha: { lat: 7.0914, lng: 80.008, zoom: 11 },
  Kalutara: { lat: 6.5854, lng: 79.9607, zoom: 11 },
  Galle: { lat: 6.0535, lng: 80.221, zoom: 11 },
  Matara: { lat: 5.9549, lng: 80.555, zoom: 11 },
  Hambantota: { lat: 6.1241, lng: 81.1185, zoom: 10 },
  Kurunegala: { lat: 7.4863, lng: 80.3623, zoom: 10 },
  Puttalam: { lat: 8.0362, lng: 79.8394, zoom: 10 },
  Kandy: { lat: 7.2906, lng: 80.6337, zoom: 11 },
  Matale: { lat: 7.4675, lng: 80.6234, zoom: 10 },
  'Nuwara Eliya': { lat: 6.9497, lng: 80.7891, zoom: 11 },
  Jaffna: { lat: 9.6615, lng: 80.0255, zoom: 11 },
  Kilinochchi: { lat: 9.3803, lng: 80.377, zoom: 10 },
  Mannar: { lat: 8.981, lng: 79.9045, zoom: 10 },
  Vavuniya: { lat: 8.7514, lng: 80.4971, zoom: 10 },
  Mullaitivu: { lat: 9.2671, lng: 80.8142, zoom: 10 },
  Batticaloa: { lat: 7.717, lng: 81.7, zoom: 10 },
  Ampara: { lat: 7.2918, lng: 81.672, zoom: 10 },
  Trincomalee: { lat: 8.5874, lng: 81.2152, zoom: 10 },
  Anuradhapura: { lat: 8.3114, lng: 80.4037, zoom: 10 },
  Polonnaruwa: { lat: 7.9403, lng: 81.0188, zoom: 10 },
  Badulla: { lat: 6.9934, lng: 81.055, zoom: 10 },
  Monaragala: { lat: 6.8726, lng: 81.3507, zoom: 10 },
  Ratnapura: { lat: 6.7056, lng: 80.3847, zoom: 10 },
  Kegalle: { lat: 7.2513, lng: 80.3464, zoom: 11 },
}

export function getDistrictView(name: string | null | undefined): DistrictView | null {
  if (!name?.trim()) return null
  const needle = name.trim().toLowerCase()
  const match = Object.entries(SRI_LANKA_DISTRICT_VIEWS).find(
    ([district]) => district.toLowerCase() === needle,
  )
  return match?.[1] ?? null
}
