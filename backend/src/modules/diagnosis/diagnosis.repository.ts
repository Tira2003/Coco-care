import { pool } from '../../db/pool.js'
import type { DiseaseReport } from '../../types/index.js'

interface ReportRow {
  id: string
  farm_id: string
  farm_name: string
  region: string
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

function mapReport(row: ReportRow): DiseaseReport {
  return {
    id: row.id,
    farmId: row.farm_id,
    farmName: row.farm_name,
    region: row.region,
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
    `SELECT r.id, r.farm_id, f.name AS farm_name, f.location AS region, r.image_url,
            r.symptoms, r.image_result, r.symptom_result, r.final_result, r.confidence,
            r.advice, r.status, r.created_at, r.review_comment
     FROM disease_reports r
     JOIN farms f ON f.id = r.farm_id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC
     LIMIT 50`,
    [userId],
  )
  return result.rows.map(mapReport)
}
