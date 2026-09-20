import { pool } from '../../db/pool.js'
import type { DiseaseReport } from '../../types/index.js'

interface ReportRow {
  id: string
  farm_id: string
  farm_name: string
  region: string
  farm_latitude?: string | number | null
  farm_longitude?: string | number | null
  farm_acreage?: string | number | null
  farm_tree_count?: number | null
  farmer_id?: string | null
  farmer_name?: string | null
  farmer_username?: string | null
  farmer_email?: string | null
  farmer_phone?: string | null
  image_url: string | null
  symptoms: Record<string, string | boolean> | null
  image_result: string | null
  symptom_result: string | null
  final_result: string | null
  confidence: string | number | null
  advice: string | null
  status: 'verified' | 'pending' | 'rejected'
  created_at: Date
  review_comment: string | null
}

const REPORT_SELECT = `SELECT r.id, r.farm_id, f.name AS farm_name, f.location AS region,
            f.latitude AS farm_latitude, f.longitude AS farm_longitude,
            f.acreage AS farm_acreage, f.tree_count AS farm_tree_count,
            u.id AS farmer_id, u.name AS farmer_name, u.username AS farmer_username,
            u.email AS farmer_email, u.phone AS farmer_phone,
            r.image_url, r.symptoms, r.image_result, r.symptom_result, r.final_result,
            r.confidence, r.advice, r.status, r.created_at, r.review_comment
     FROM disease_reports r
     JOIN farms f ON f.id = r.farm_id
     JOIN farmers u ON u.id = r.user_id`

function mapReport(row: ReportRow): DiseaseReport {
  return {
    id: row.id,
    farmId: row.farm_id,
    farmName: row.farm_name,
    region: row.region,
    farmer: row.farmer_id
      ? {
          id: row.farmer_id,
          name: row.farmer_name ?? 'Farmer',
          username: row.farmer_username ?? '',
          email: row.farmer_email,
          phone: row.farmer_phone,
        }
      : undefined,
    farm: {
      id: row.farm_id,
      name: row.farm_name,
      location: row.region,
      latitude: Number(row.farm_latitude ?? 0),
      longitude: Number(row.farm_longitude ?? 0),
      acreage: Number(row.farm_acreage ?? 0),
      treeCount: Number(row.farm_tree_count ?? 0),
    },
    imageUrl: row.image_url ?? undefined,
    symptoms: row.symptoms ?? undefined,
    imageResult: row.image_result ?? undefined,
    symptomResult: row.symptom_result ?? undefined,
    finalResult: row.final_result ?? undefined,
    confidence: Number(row.confidence ?? 0),
    advice: row.advice ?? undefined,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    reviewComment: row.review_comment ?? undefined,
  }
}

export async function insertDiseaseReport(input: {
  farmId: string
  userId: string
  imageUrl?: string
  symptoms: Record<string, string | boolean>
  imageResult: string
  symptomResult: string
  finalResult: string
  confidence: number
  advice: string
  status: 'verified' | 'pending'
}): Promise<string> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO disease_reports (
       farm_id, user_id, image_url, symptoms, image_result, symptom_result,
       final_result, confidence, advice, status
     )
     VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      input.farmId,
      input.userId,
      input.imageUrl ?? null,
      JSON.stringify(input.symptoms),
      input.imageResult.slice(0, 200),
      input.symptomResult.slice(0, 200),
      input.finalResult.slice(0, 200),
      Number(input.confidence.toFixed(3)),
      input.advice,
      input.status,
    ],
  )
  return result.rows[0]!.id
}

export async function listReportsForUser(userId: string): Promise<DiseaseReport[]> {
  const result = await pool.query<ReportRow>(
    `${REPORT_SELECT}
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC
     LIMIT 50`,
    [userId],
  )
  return result.rows.map(mapReport)
}

export async function listPendingReportsByRegion(district: string): Promise<DiseaseReport[]> {
  const result = await pool.query<ReportRow>(
    `${REPORT_SELECT}
     WHERE r.status = 'pending'
       AND lower(trim(f.location)) = lower(trim($1))
     ORDER BY r.created_at ASC
     LIMIT 100`,
    [district],
  )
  return result.rows.map(mapReport)
}

export async function listVerifiedReports(limit = 80): Promise<DiseaseReport[]> {
  const result = await pool.query<ReportRow>(
    `${REPORT_SELECT}
     WHERE r.status = 'verified'
     ORDER BY r.created_at DESC
     LIMIT $1`,
    [limit],
  )
  return result.rows.map(mapReport)
}

export async function getReportById(id: string): Promise<DiseaseReport | null> {
  const result = await pool.query<ReportRow>(`${REPORT_SELECT} WHERE r.id = $1 LIMIT 1`, [id])
  const row = result.rows[0]
  return row ? mapReport(row) : null
}

export async function reviewDiseaseReport(
  id: string,
  input: {
    status: 'verified' | 'rejected'
    comment?: string
    advice?: string
    officerId?: string
  },
): Promise<DiseaseReport | null> {
  const result = await pool.query<ReportRow>(
    `UPDATE disease_reports
     SET status = $2,
         review_comment = COALESCE($3, review_comment),
         advice = COALESCE($4, advice),
         reviewed_by_officer = COALESCE($5, reviewed_by_officer)
     WHERE id = $1
     RETURNING id`,
    [id, input.status, input.comment ?? null, input.advice ?? null, input.officerId ?? null],
  )
  if (!result.rows[0]) return null
  return getReportById(id)
}
