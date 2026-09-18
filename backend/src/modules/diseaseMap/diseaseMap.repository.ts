import { pool } from '../../db/pool.js'
import type { DiseaseAlert, HeatmapPoint, VerificationStatus } from '../../types/index.js'
import type { HeatmapQuery } from './diseaseMap.schemas.js'
import { threatLevel, verificationStatus } from './threat.js'

export interface OutbreakRow {
  id: string
  farmId: string
  userId: string
  farmName: string
  district: string
  lat: number
  lng: number
  diseaseType: string
  confidence: number
  status: 'verified' | 'pending' | 'rejected'
  createdAt: Date
}

interface OutbreakSqlRow {
  id: string
  farm_id: string
  user_id: string
  farm_name: string
  district: string
  latitude: number
  longitude: number
  disease_type: string
  confidence: string | number | null
  status: 'verified' | 'pending' | 'rejected'
  created_at: Date
}

interface AlertRow {
  id: string
  report_id: string
  farm_id: string
  disease_type: string
  alert_type: VerificationStatus
  distance_km: string | number
  message: string
  read_at: Date | null
  created_at: Date
}

function mapOutbreak(row: OutbreakSqlRow): OutbreakRow {
  return {
    id: row.id,
    farmId: row.farm_id,
    userId: row.user_id,
    farmName: row.farm_name,
    district: row.district,
    lat: Number(row.latitude),
    lng: Number(row.longitude),
    diseaseType: row.disease_type,
    confidence: Number(row.confidence ?? 0),
    status: row.status,
    createdAt: row.created_at,
  }
}

export function toHeatmapPoint(row: OutbreakRow): HeatmapPoint {
  const weight = Math.max(0, Math.min(1, row.confidence))
  return {
    lat: row.lat,
    lng: row.lng,
    weight,
    diseaseType: row.diseaseType,
    verificationStatus: verificationStatus(row.status),
    threatLevel: threatLevel(weight),
    createdAt: row.createdAt.toISOString(),
    reportId: row.id,
    farmId: row.farmId,
    farmName: row.farmName,
    district: row.district,
    count: 1,
  }
}

export function aggregateHeatmapPoints(rows: OutbreakRow[]): HeatmapPoint[] {
  const groups = new Map<string, OutbreakRow[]>()
  for (const row of rows) {
    const key = `${row.farmId}::${row.diseaseType}`
    const list = groups.get(key) ?? []
    list.push(row)
    groups.set(key, list)
  }

  return [...groups.values()].map((group) => {
    const latest = [...group].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]!
    const verified = group.some((row) => row.status === 'verified')
    const weight = Math.max(...group.map((row) => row.confidence))
    return {
      ...toHeatmapPoint({
        ...latest,
        confidence: weight,
        status: verified ? 'verified' : latest.status,
      }),
      count: group.length,
    }
  })
}

export async function listOutbreakRows(filters: HeatmapQuery = {}): Promise<OutbreakRow[]> {
  const result = await pool.query<OutbreakSqlRow>(
    `SELECT r.id,
            r.farm_id,
            r.user_id,
            f.name AS farm_name,
            f.location AS district,
            f.latitude,
            f.longitude,
            r.final_result AS disease_type,
            r.confidence,
            r.status,
            r.created_at
     FROM disease_reports r
     JOIN farms f ON f.id = r.farm_id
     WHERE r.status IN ('verified', 'pending')
       AND COALESCE(r.final_result, '') <> ''
       AND r.final_result NOT ILIKE '%healthy%'
       AND r.final_result NOT ILIKE 'inconclusive%'
       AND (r.status = 'verified' OR COALESCE(r.confidence, 0) >= 0.55)
       AND ($1::text IS NULL OR LOWER(TRIM(r.final_result)) = LOWER(TRIM($1)))
       AND ($2::text IS NULL OR LOWER(TRIM(f.location)) = LOWER(TRIM($2)))
       AND ($3::numeric IS NULL OR COALESCE(r.confidence, 0) >= $3)
       AND (
         $4::date IS NULL
         OR (r.created_at AT TIME ZONE 'Asia/Colombo')::date >= $4::date
       )
       AND (
         $5::date IS NULL
         OR (r.created_at AT TIME ZONE 'Asia/Colombo')::date <= $5::date
       )
     ORDER BY r.created_at DESC
     LIMIT 500`,
    [
      filters.diseaseType || null,
      filters.district || null,
      filters.minWeight ?? null,
      filters.from || null,
      filters.to || null,
    ],
  )
  return result.rows.map(mapOutbreak)
}

export async function listAlertsForFarmer(userId: string): Promise<DiseaseAlert[]> {
  const result = await pool.query<AlertRow>(
    `SELECT id, report_id, farm_id, disease_type, alert_type, distance_km, message, read_at, created_at
     FROM disease_alerts
     WHERE farmer_user_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId],
  )
  return result.rows.map((row) => {
    const distanceKm = Number(row.distance_km)
    const weightGuess = distanceKm <= 10 ? 0.85 : distanceKm <= 18 ? 0.7 : 0.6
    return {
      id: row.id,
      reportId: row.report_id,
      farmId: row.farm_id,
      diseaseType: row.disease_type,
      alertType: row.alert_type,
      distanceKm: Math.round(distanceKm * 10) / 10,
      message: row.message,
      read: Boolean(row.read_at),
      createdAt: row.created_at.toISOString(),
      severity: threatLevel(weightGuess),
    }
  })
}

export async function upsertAlert(input: {
  reportId: string
  farmerUserId: string
  farmId: string
  diseaseType: string
  distanceKm: number
  message: string
  alertType: VerificationStatus
  createdAt: string
}) {
  await pool.query(
    `INSERT INTO disease_alerts (
       report_id, farmer_user_id, farm_id, disease_type, distance_km, message, alert_type, created_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::timestamptz)
     ON CONFLICT (report_id, farmer_user_id, farm_id) DO UPDATE
       SET distance_km = EXCLUDED.distance_km,
           message = EXCLUDED.message,
           alert_type = EXCLUDED.alert_type`,
    [
      input.reportId,
      input.farmerUserId,
      input.farmId,
      input.diseaseType,
      input.distanceKm,
      input.message,
      input.alertType,
      input.createdAt,
    ],
  )
}

export async function markAlertRead(id: string, userId: string) {
  const result = await pool.query<AlertRow>(
    `UPDATE disease_alerts
     SET read_at = COALESCE(read_at, now())
     WHERE id = $1 AND farmer_user_id = $2
     RETURNING id, report_id, farm_id, disease_type, alert_type, distance_km, message, read_at, created_at`,
    [id, userId],
  )
  const row = result.rows[0]
  if (!row) return null
  const distanceKm = Number(row.distance_km)
  return {
    id: row.id,
    reportId: row.report_id,
    farmId: row.farm_id,
    diseaseType: row.disease_type,
    alertType: row.alert_type,
    distanceKm: Math.round(distanceKm * 10) / 10,
    message: row.message,
    read: true,
    createdAt: row.created_at.toISOString(),
    severity: threatLevel(distanceKm <= 10 ? 0.85 : 0.65),
  }
}
