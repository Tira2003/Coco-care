import type { HeatmapPoint, ThreatLevel, VerificationStatus } from '../../types/index.js'

export function threatLevel(weight: number): ThreatLevel {
  if (weight >= 0.8) return 'critical'
  if (weight >= 0.7) return 'high'
  if (weight >= 0.6) return 'medium'
  return 'low'
}

export function verificationStatus(status: string): VerificationStatus {
  return status === 'verified' ? 'verified' : 'ai_suspected'
}

export function toPublicHeatmapPoint(point: HeatmapPoint): HeatmapPoint {
  return {
    lat: point.lat,
    lng: point.lng,
    weight: point.weight,
    diseaseType: point.diseaseType,
    verificationStatus: point.verificationStatus,
    threatLevel: point.threatLevel,
    createdAt: point.createdAt,
    district: point.district,
    count: point.count,
  }
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}
