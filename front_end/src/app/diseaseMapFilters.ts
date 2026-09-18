import type { HeatmapPoint, NearbyOutbreak, ThreatLevel } from '@/types'

export type HeatmapFilterState = {
  diseaseType?: string
  district?: string
  minWeight?: number
  from?: string
  to?: string
}

export const THREAT_FILTERS = [
  { value: 0.6, label: 'Medium and above' },
  { value: 0.7, label: 'High and above' },
  { value: 0.8, label: 'Critical only' },
] as const

export function threatFromWeight(weight: number): ThreatLevel {
  if (weight >= 0.8) return 'critical'
  if (weight >= 0.7) return 'high'
  if (weight >= 0.6) return 'medium'
  return 'low'
}

export function todayStamp(now = new Date()) {
  return localDayFromDate(now)
}

export function localDayFromDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function localDay(iso?: string | null) {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    const match = iso.match(/^(\d{4}-\d{2}-\d{2})/)
    return match?.[1] ?? null
  }
  return localDayFromDate(date)
}

export function threatLabel(level: ThreatLevel) {
  return level.charAt(0).toUpperCase() + level.slice(1)
}

export function threatFilterLabel(minWeight: number) {
  return THREAT_FILTERS.find((option) => option.value === minWeight)?.label ?? `≥ ${Math.round(minWeight * 100)}%`
}

export function hasActiveFilters(filters: HeatmapFilterState) {
  return Boolean(
    filters.diseaseType ||
      filters.district ||
      filters.minWeight != null ||
      filters.from ||
      filters.to,
  )
}

export function pointThreat(point: { weight: number; threatLevel?: ThreatLevel }) {
  return point.threatLevel ?? threatFromWeight(point.weight)
}

export function matchesHeatmapFilters(
  point: {
    diseaseType: string
    district?: string
    weight: number
    threatLevel?: ThreatLevel
    createdAt?: string
  },
  filters: HeatmapFilterState,
) {
  if (
    filters.diseaseType &&
    point.diseaseType.trim().toLowerCase() !== filters.diseaseType.trim().toLowerCase()
  ) {
    return false
  }

  if (
    filters.district &&
    (point.district ?? '').trim().toLowerCase() !== filters.district.trim().toLowerCase()
  ) {
    return false
  }

  if (filters.minWeight != null && point.weight < filters.minWeight) {
    return false
  }

  const day = localDay(point.createdAt)
  if (day) {
    if (filters.from && day < filters.from) return false
    if (filters.to && day > filters.to) return false
  }

  return true
}

export function applyHeatmapFilters<T extends HeatmapPoint | NearbyOutbreak>(
  points: T[],
  filters: HeatmapFilterState,
) {
  return points.filter((point) => matchesHeatmapFilters(point, filters))
}
