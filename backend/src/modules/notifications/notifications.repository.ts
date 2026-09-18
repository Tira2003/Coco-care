import { pool } from '../../db/pool.js'
import type { InboxSource, NotificationAudience, UserRole } from '../../types/index.js'

export interface BroadcastRow {
  id: string
  title: string
  message: string
  audience: NotificationAudience
  created_by: string | null
  created_at: Date
}

export interface NotificationStateRow {
  source: InboxSource
  source_id: string
  read_at: Date | null
  dismissed_at: Date | null
}

export interface PendingRegionRow {
  count: string | number
  latest_at: Date | null
}

let schemaReady: Promise<void> | null = null

async function createSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS broadcasts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      message text NOT NULL,
      audience text NOT NULL DEFAULT 'all',
      created_by uuid,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_notification_state (
      user_id uuid NOT NULL,
      user_role text NOT NULL,
      source text NOT NULL,
      source_id text NOT NULL,
      read_at timestamptz,
      dismissed_at timestamptz,
      updated_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, user_role, source, source_id)
    )
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS broadcasts_created_idx
      ON broadcasts (created_at DESC)
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS user_notification_state_user_idx
      ON user_notification_state (user_id, user_role)
  `)
}

export function ensureNotificationSchema() {
  if (!schemaReady) {
    schemaReady = createSchema().catch((err) => {
      schemaReady = null
      throw err
    })
  }
  return schemaReady
}

export async function insertBroadcast(input: {
  title: string
  message: string
  audience: NotificationAudience
  createdBy: string
}) {
  const result = await pool.query<BroadcastRow>(
    `INSERT INTO broadcasts (title, message, audience, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, message, audience, created_by, created_at`,
    [input.title, input.message, input.audience, input.createdBy],
  )
  return result.rows[0]!
}

export async function listBroadcasts() {
  const result = await pool.query<BroadcastRow>(
    `SELECT id, title, message, audience, created_by, created_at
     FROM broadcasts
     ORDER BY created_at DESC
     LIMIT 100`,
  )
  return result.rows
}

export async function listBroadcastsForRole(role: UserRole) {
  const result = await pool.query<BroadcastRow>(
    `SELECT id, title, message, audience, created_by, created_at
     FROM broadcasts
     WHERE audience = 'all'
        OR audience = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [role === 'farmer' ? 'farmers' : role === 'officer' ? 'officers' : 'all'],
  )
  return result.rows
}

export async function countRecipients(audience: NotificationAudience) {
  if (audience === 'farmers') {
    const result = await pool.query<{ count: string | number }>(
      `SELECT COUNT(*) AS count FROM farmers WHERE is_active = true`,
    )
    return Number(result.rows[0]?.count ?? 0)
  }
  if (audience === 'officers') {
    const result = await pool.query<{ count: string | number }>(
      `SELECT COUNT(*) AS count FROM officers WHERE is_active = true`,
    )
    return Number(result.rows[0]?.count ?? 0)
  }
  const result = await pool.query<{ count: string | number }>(
    `SELECT
       (SELECT COUNT(*) FROM farmers WHERE is_active = true) +
       (SELECT COUNT(*) FROM officers WHERE is_active = true) AS count`,
  )
  return Number(result.rows[0]?.count ?? 0)
}

export async function listNotificationState(userId: string, role: UserRole) {
  const result = await pool.query<NotificationStateRow>(
    `SELECT source, source_id, read_at, dismissed_at
     FROM user_notification_state
     WHERE user_id = $1 AND user_role = $2`,
    [userId, role],
  )
  return result.rows
}

export async function upsertNotificationState(input: {
  userId: string
  role: UserRole
  source: InboxSource
  sourceId: string
  read?: boolean
  dismiss?: boolean
}) {
  await pool.query(
    `INSERT INTO user_notification_state (
       user_id, user_role, source, source_id, read_at, dismissed_at, updated_at
     )
     VALUES (
       $1, $2, $3, $4,
       CASE WHEN $5 THEN now() ELSE NULL END,
       CASE WHEN $6 THEN now() ELSE NULL END,
       now()
     )
     ON CONFLICT (user_id, user_role, source, source_id) DO UPDATE
       SET read_at = CASE
             WHEN $5 THEN now()
             ELSE user_notification_state.read_at
           END,
           dismissed_at = CASE
             WHEN $6 THEN now()
             ELSE user_notification_state.dismissed_at
           END,
           updated_at = now()`,
    [input.userId, input.role, input.source, input.sourceId, Boolean(input.read), Boolean(input.dismiss)],
  )
}

export async function markAllStateRead(
  userId: string,
  role: UserRole,
  items: Array<{ source: InboxSource; sourceId: string }>,
) {
  for (const item of items) {
    await upsertNotificationState({
      userId,
      role,
      source: item.source,
      sourceId: item.sourceId,
      read: true,
    })
  }
}

export async function pendingReportsInRegion(district: string) {
  const result = await pool.query<PendingRegionRow>(
    `SELECT COUNT(*) AS count, MAX(r.created_at) AS latest_at
     FROM disease_reports r
     JOIN farms f ON f.id = r.farm_id
     WHERE r.status = 'pending'
       AND lower(trim(f.location)) = lower(trim($1))`,
    [district],
  )
  const row = result.rows[0]
  return {
    count: Number(row?.count ?? 0),
    latestAt: row?.latest_at ?? null,
  }
}
