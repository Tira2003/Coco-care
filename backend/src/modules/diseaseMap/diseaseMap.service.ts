import { env } from '../../config/env.js'
import { forbidden, notFound } from '../../utils/errors.js'
import type {
  DiseaseAlert,
  DiseaseMapStats,
  HeatmapPoint,
  NearbyOutbreak,
  NearbyResponse,
} from '../../types/index.js'
import { listFarmsByUserId } from '../auth/auth.repository.js'
import {
  aggregateHeatmapPoints,
  listAlertsForFarmer,
  listOutbreakRows,
  markAlertRead,
  markAllAlertsRead,
  upsertAlert,
} from './diseaseMap.repository.js'
import type { HeatmapQuery, NearbyQuery } from './diseaseMap.schemas.js'
import { haversineKm, threatLevel, toPublicHeatmapPoint } from './threat.js'

export function assertFarmer(role: string) {
  if (role !== 'farmer') throw forbidden('Farmer access required')
}

export async function getHeatmap(filters: HeatmapQuery): Promise<HeatmapPoint[]> {
  const rows = await listOutbreakRows(filters)
  return aggregateHeatmapPoints(rows)
}

export async function getPublicHeatmap(): Promise<HeatmapPoint[]> {
  const points = await getHeatmap({})
  return points.map(toPublicHeatmapPoint)
}

export async function getStats(filters: HeatmapQuery): Promise<DiseaseMapStats> {
  const points = await getHeatmap(filters)
  const byDiseaseMap = new Map<string, number>()
  const byWeekMap = new Map<string, number>()

  for (const point of points) {
    byDiseaseMap.set(point.diseaseType, (byDiseaseMap.get(point.diseaseType) ?? 0) + (point.count ?? 1))
    const week = point.createdAt
      ? point.createdAt.slice(0, 10)
      : 'unknown'
    byWeekMap.set(week, (byWeekMap.get(week) ?? 0) + (point.count ?? 1))
  }

  return {
    byDisease: [...byDiseaseMap.entries()]
      .map(([diseaseType, count]) => ({ diseaseType, count }))
      .sort((a, b) => b.count - a.count),
    byWeek: [...byWeekMap.entries()]
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-12),
    highRiskCount: points.filter((point) => point.weight >= 0.7).length,
  }
}

export async function getNearby(userId: string, query: NearbyQuery): Promise<NearbyResponse> {
  const radiusKm = query.radiusKm ?? env.diseaseAlertRadiusKm
  const farms = await listFarmsByUserId(userId)
  const scoped = query.farmId ? farms.filter((farm) => farm.id === query.farmId) : farms
  const rows = await listOutbreakRows({})

  let nearest: NearbyResponse['nearest'] = null

  const farmBlocks = scoped.map((farm) => {
    const outbreaks: NearbyOutbreak[] = []
    for (const row of rows) {
      if (row.farmId === farm.id) continue
      const distanceKm = Math.round(haversineKm(
        { lat: farm.latitude, lng: farm.longitude },
        { lat: row.lat, lng: row.lng },
      ) * 10) / 10
      const candidate = {
        diseaseType: row.diseaseType,
        distanceKm,
        farmName: row.farmName,
        threatLevel: threatLevel(row.confidence),
        verificationStatus: row.status === 'verified' ? 'verified' as const : 'ai_suspected' as const,
      }
      if (!nearest || distanceKm < nearest.distanceKm) nearest = candidate
      if (distanceKm > radiusKm) continue
      outbreaks.push({
        lat: row.lat,
        lng: row.lng,
        diseaseType: row.diseaseType,
        weight: row.confidence,
        distanceKm,
        reportId: row.id,
        farmId: row.farmId,
        verificationStatus: candidate.verificationStatus,
        threatLevel: candidate.threatLevel,
        createdAt: row.createdAt.toISOString(),
      })
    }
    outbreaks.sort((a, b) => a.distanceKm - b.distanceKm)
    return {
      farmId: farm.id,
      farmName: farm.name,
      lat: farm.latitude,
      lng: farm.longitude,
      outbreaks,
    }
  })

  return { radiusKm, farms: farmBlocks, nearest }
}

export async function getAlerts(userId: string): Promise<DiseaseAlert[]> {
  const nearby = await getNearby(userId, { radiusKm: env.diseaseAlertRadiusKm })
  for (const farm of nearby.farms) {
    for (const outbreak of farm.outbreaks) {
      const label = outbreak.verificationStatus === 'verified' ? 'Verified' : 'AI-suspected'
      await upsertAlert({
        reportId: outbreak.reportId,
        farmerUserId: userId,
        farmId: farm.farmId,
        diseaseType: outbreak.diseaseType,
        distanceKm: outbreak.distanceKm,
        alertType: outbreak.verificationStatus,
        createdAt: outbreak.createdAt,
        message: `${label} ${outbreak.diseaseType} is ${outbreak.distanceKm} km from ${farm.farmName} (within your ${nearby.radiusKm} km watch zone). Threat: ${outbreak.threatLevel}.`,
      })
    }
  }

  const alerts = await listAlertsForFarmer(userId)
  return alerts.map((alert) => {
    const match = nearby.farms
      .flatMap((farm) => farm.outbreaks.map((outbreak) => ({ farm, outbreak })))
      .find(({ farm, outbreak }) => outbreak.reportId === alert.reportId && farm.farmId === alert.farmId)
    return {
      ...alert,
      severity: match?.outbreak.threatLevel ?? alert.severity,
    }
  })
}

export async function readAlert(userId: string, alertId: string) {
  const alert = await markAlertRead(alertId, userId)
  if (!alert) throw notFound('Alert not found')
  return alert
}

export async function readAllAlerts(userId: string) {
  await markAllAlertsRead(userId)
}
