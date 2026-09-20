import { pool } from '../../db/pool.js'
import type { ConsultationStatus, LastSender } from './routing.js'

export interface ConsultationRow {
  id: string
  farmer_user_id: string
  officer_user_id: string | null
  farm_id: string | null
  report_id: string | null
  district: string
  topic: string
  status: ConsultationStatus
  last_sender: LastSender
  created_at: Date
  updated_at: Date
  resolved_at: Date | null
  farm_name: string | null
  farmer_name: string
  farmer_phone: string | null
  officer_name: string | null
  report_label: string | null
  report_status: string | null
  last_message: string | null
  last_attachments?: unknown
}

export interface ConsultationMessageRow {
  id: string
  consultation_id: string
  sender_role: LastSender
  sender_user_id: string
  content: string
  attachments: unknown
  created_at: Date
}

export interface RegionalOfficerRow {
  id: string
  name: string
  open_count: string | number
}

export interface OwnedReportRow {
  id: string
  farm_id: string
  final_result: string | null
  status: string
  created_at: Date
  farm_name: string
  location: string
}

const LIST_SELECT = `
  SELECT
    c.id,
    c.farmer_user_id,
    c.officer_user_id,
    c.farm_id,
    c.report_id,
    c.district,
    c.topic,
    c.status,
    c.last_sender,
    c.created_at,
    c.updated_at,
    c.resolved_at,
    f.name AS farm_name,
    fa.name AS farmer_name,
    fa.phone AS farmer_phone,
    o.name AS officer_name,
    r.final_result AS report_label,
    r.status AS report_status,
    m.content AS last_message,
    m.attachments AS last_attachments
  FROM officer_consultations c
  JOIN farmers fa ON fa.id = c.farmer_user_id
  LEFT JOIN farms f ON f.id = c.farm_id
  LEFT JOIN officers o ON o.id = c.officer_user_id
  LEFT JOIN disease_reports r ON r.id = c.report_id
  LEFT JOIN LATERAL (
    SELECT content, attachments
    FROM officer_consultation_messages
    WHERE consultation_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
  ) m ON true
`

let schemaReady: Promise<void> | null = null

async function createSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS officer_consultations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      farmer_user_id uuid NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
      officer_user_id uuid REFERENCES officers(id) ON DELETE SET NULL,
      farm_id uuid REFERENCES farms(id) ON DELETE SET NULL,
      report_id uuid REFERENCES disease_reports(id) ON DELETE SET NULL,
      district text NOT NULL,
      topic text NOT NULL,
      status text NOT NULL DEFAULT 'open',
      last_sender text NOT NULL DEFAULT 'farmer',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      resolved_at timestamptz
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS officer_consultation_messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      consultation_id uuid NOT NULL REFERENCES officer_consultations(id) ON DELETE CASCADE,
      sender_role text NOT NULL,
      sender_user_id uuid NOT NULL,
      content text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS officer_consultations_farmer_idx
      ON officer_consultations (farmer_user_id, updated_at DESC)
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS officer_consultations_officer_idx
      ON officer_consultations (officer_user_id, updated_at DESC)
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS officer_consultations_district_idx
      ON officer_consultations (lower(district), status)
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS officer_consultation_messages_thread_idx
      ON officer_consultation_messages (consultation_id, created_at)
  `)
  await pool.query(`
    ALTER TABLE officer_consultation_messages
      ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb
  `)
}

export function ensureConsultationSchema() {
  if (!schemaReady) {
    schemaReady = createSchema().catch((err) => {
      schemaReady = null
      throw err
    })
  }
  return schemaReady
}

export async function findOwnedReport(reportId: string, farmerUserId: string) {
  const result = await pool.query<OwnedReportRow>(
    `SELECT r.id, r.farm_id, r.final_result, r.status, r.created_at,
            f.name AS farm_name, f.location
     FROM disease_reports r
     JOIN farms f ON f.id = r.farm_id
     WHERE r.id = $1 AND r.user_id = $2
     LIMIT 1`,
    [reportId, farmerUserId],
  )
  return result.rows[0] ?? null
}

export async function listRegionalOfficers(district: string) {
  const result = await pool.query<RegionalOfficerRow>(
    `SELECT o.id, o.name,
            COUNT(c.id) FILTER (WHERE c.status = 'open') AS open_count
     FROM officers o
     LEFT JOIN officer_consultations c
       ON c.officer_user_id = o.id
     WHERE o.is_active = true
       AND lower(trim(o.assigned_region)) = lower(trim($1))
     GROUP BY o.id, o.name
     ORDER BY o.name`,
    [district],
  )
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    openCount: Number(row.open_count ?? 0),
  }))
}

export async function insertConsultation(input: {
  farmerUserId: string
  officerUserId: string | null
  farmId: string | null
  reportId: string | null
  district: string
  topic: string
  message: string
  attachments?: unknown
}) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const created = await client.query<{ id: string }>(
      `INSERT INTO officer_consultations (
         farmer_user_id, officer_user_id, farm_id, report_id, district, topic, status, last_sender
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'open', 'farmer')
       RETURNING id`,
      [
        input.farmerUserId,
        input.officerUserId,
        input.farmId,
        input.reportId,
        input.district,
        input.topic,
      ],
    )
    const id = created.rows[0]!.id
    await client.query(
      `INSERT INTO officer_consultation_messages (
         consultation_id, sender_role, sender_user_id, content, attachments
       )
       VALUES ($1, 'farmer', $2, $3, $4::jsonb)`,
      [id, input.farmerUserId, input.message, JSON.stringify(input.attachments ?? [])],
    )
    await client.query('COMMIT')
    return id
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function listConsultationsForFarmer(farmerUserId: string) {
  const result = await pool.query<ConsultationRow>(
    `${LIST_SELECT}
     WHERE c.farmer_user_id = $1
     ORDER BY c.updated_at DESC`,
    [farmerUserId],
  )
  return result.rows
}

export async function listConsultationsForRegion(district: string) {
  const result = await pool.query<ConsultationRow>(
    `${LIST_SELECT}
     WHERE lower(trim(c.district)) = lower(trim($1))
     ORDER BY
       CASE
         WHEN c.status = 'open' AND c.last_sender = 'farmer' THEN 0
         WHEN c.status = 'open' THEN 1
         ELSE 2
       END,
       c.updated_at DESC`,
    [district],
  )
  return result.rows
}

export async function getConsultationById(id: string) {
  const result = await pool.query<ConsultationRow>(
    `${LIST_SELECT}
     WHERE c.id = $1
     LIMIT 1`,
    [id],
  )
  return result.rows[0] ?? null
}

export async function listMessages(consultationId: string) {
  const result = await pool.query<ConsultationMessageRow>(
    `SELECT id, consultation_id, sender_role, sender_user_id, content, attachments, created_at
     FROM officer_consultation_messages
     WHERE consultation_id = $1
     ORDER BY created_at ASC`,
    [consultationId],
  )
  return result.rows
}

export async function insertReply(input: {
  consultationId: string
  senderRole: LastSender
  senderUserId: string
  content: string
  attachments?: unknown
  officerUserId?: string | null
}) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(
      `INSERT INTO officer_consultation_messages (
         consultation_id, sender_role, sender_user_id, content, attachments
       )
       VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [
        input.consultationId,
        input.senderRole,
        input.senderUserId,
        input.content,
        JSON.stringify(input.attachments ?? []),
      ],
    )
    await client.query(
      `UPDATE officer_consultations
       SET last_sender = $2,
           status = 'open',
           resolved_at = NULL,
           officer_user_id = COALESCE($3, officer_user_id),
           updated_at = now()
       WHERE id = $1`,
      [input.consultationId, input.senderRole, input.officerUserId ?? null],
    )
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function markResolved(consultationId: string) {
  await pool.query(
    `UPDATE officer_consultations
     SET status = 'resolved',
         resolved_at = now(),
         updated_at = now()
     WHERE id = $1`,
    [consultationId],
  )
}

export async function deleteConsultation(consultationId: string) {
  await pool.query(`DELETE FROM officer_consultations WHERE id = $1`, [consultationId])
}
