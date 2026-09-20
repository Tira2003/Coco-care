import type { Pool, PoolClient } from 'pg'
import { pool } from '../../db/pool.js'
import type { AuthAccount, Farm, UserRole } from '../../types/index.js'

type Db = Pool | PoolClient

interface AccountRow {
  id: string
  username: string
  password_hash: string
  name: string
  email: string | null
  phone: string | null
  is_active: boolean
  officer_id?: string | null
  assigned_region?: string | null
}

interface FarmRow {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  acreage: string | number
  tree_count: number
  primary_farm_id?: string | null
}

const ACCOUNT_TABLE: Record<UserRole, 'farmers' | 'officers' | 'admins'> = {
  farmer: 'farmers',
  officer: 'officers',
  admin: 'admins',
}

let primaryFarmColumnReady = false

export async function ensurePrimaryFarmColumn() {
  if (primaryFarmColumnReady) return
  await pool.query(`
    ALTER TABLE farmers
      ADD COLUMN IF NOT EXISTS primary_farm_id uuid REFERENCES farms(id) ON DELETE SET NULL
  `)
  primaryFarmColumnReady = true
}

function mapAccount(row: AccountRow, role: UserRole): AuthAccount {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role,
    isActive: row.is_active,
    officerId: row.officer_id ?? null,
    assignedRegion: row.assigned_region ?? null,
  }
}

export function mapFarm(row: FarmRow, isPrimary = false): Farm {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    acreage: Number(row.acreage),
    treeCount: row.tree_count,
    isPrimary,
  }
}

export async function findAccountByUsername(username: string): Promise<AuthAccount | null> {
  const farmer = await pool.query<AccountRow>(
    `SELECT id, username, password_hash, name, email, phone, is_active
     FROM farmers
     WHERE lower(username) = lower($1)
     LIMIT 1`,
    [username],
  )
  if (farmer.rows[0]) return mapAccount(farmer.rows[0], 'farmer')

  const officer = await pool.query<AccountRow>(
    `SELECT id, username, password_hash, name, email, phone, is_active, officer_id, assigned_region
     FROM officers
     WHERE lower(username) = lower($1)
     LIMIT 1`,
    [username],
  )
  if (officer.rows[0]) return mapAccount(officer.rows[0], 'officer')

  const admin = await pool.query<AccountRow>(
    `SELECT id, username, password_hash, name, email, phone, is_active
     FROM admins
     WHERE lower(username) = lower($1)
     LIMIT 1`,
    [username],
  )
  if (admin.rows[0]) return mapAccount(admin.rows[0], 'admin')

  return null
}

export async function findAccountById(id: string, role: UserRole): Promise<AuthAccount | null> {
  const table = ACCOUNT_TABLE[role]
  const extra = role === 'officer' ? ', officer_id, assigned_region' : ''
  const result = await pool.query<AccountRow>(
    `SELECT id, username, password_hash, name, email, phone, is_active${extra}
     FROM ${table}
     WHERE id = $1
     LIMIT 1`,
    [id],
  )
  const row = result.rows[0]
  return row ? mapAccount(row, role) : null
}

export async function usernameExists(username: string, client: Db = pool) {
  const result = await client.query(
    `SELECT 1 FROM (
       SELECT username FROM farmers
       UNION ALL
       SELECT username FROM officers
       UNION ALL
       SELECT username FROM admins
     ) accounts
     WHERE lower(username) = lower($1)
     LIMIT 1`,
    [username],
  )
  return (result.rowCount ?? 0) > 0
}

export async function emailExists(email: string, client: Db = pool) {
  const result = await client.query(
    `SELECT 1 FROM (
       SELECT email FROM farmers
       UNION ALL
       SELECT email FROM officers
       UNION ALL
       SELECT email FROM admins
     ) accounts
     WHERE email IS NOT NULL AND lower(email) = lower($1)
     LIMIT 1`,
    [email],
  )
  return (result.rowCount ?? 0) > 0
}

export async function emailTakenByOther(email: string, accountId: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT 1 FROM (
       SELECT id, email FROM farmers
       UNION ALL
       SELECT id, email FROM officers
       UNION ALL
       SELECT id, email FROM admins
     ) accounts
     WHERE email IS NOT NULL AND lower(email) = lower($1) AND id <> $2
     LIMIT 1`,
    [email, accountId],
  )
  return (result.rowCount ?? 0) > 0
}

export async function updateFarmerContact(
  id: string,
  input: { name: string; email: string | null; phone: string | null },
): Promise<AuthAccount | null> {
  const result = await pool.query<AccountRow>(
    `UPDATE farmers
     SET name = $2, email = $3, phone = $4, updated_at = now()
     WHERE id = $1
     RETURNING id, username, password_hash, name, email, phone, is_active`,
    [id, input.name, input.email, input.phone],
  )
  const row = result.rows[0]
  return row ? mapAccount(row, 'farmer') : null
}

export async function updateOfficerContact(
  id: string,
  input: { name: string; email: string | null; phone: string | null },
): Promise<AuthAccount | null> {
  const result = await pool.query<AccountRow>(
    `UPDATE officers
     SET name = $2, email = $3, phone = $4, updated_at = now()
     WHERE id = $1
     RETURNING id, username, password_hash, name, email, phone, is_active, officer_id, assigned_region`,
    [id, input.name, input.email, input.phone],
  )
  const row = result.rows[0]
  return row ? mapAccount(row, 'officer') : null
}

export async function insertOfficer(input: {
  username: string
  passwordHash: string
  name: string
  email: string | null
  phone: string | null
  officerId: string | null
  assignedRegion: string | null
  adminPassword?: string | null
}): Promise<AuthAccount> {
  const result = await pool.query<AccountRow>(
    `INSERT INTO officers (
       username, password_hash, name, email, phone, officer_id, assigned_region, admin_password
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, username, password_hash, name, email, phone, is_active, officer_id, assigned_region`,
    [
      input.username,
      input.passwordHash,
      input.name,
      input.email,
      input.phone,
      input.officerId,
      input.assignedRegion,
      input.adminPassword ?? null,
    ],
  )
  return mapAccount(result.rows[0]!, 'officer')
}

export async function insertFarmer(
  client: Db,
  input: {
    username: string
    passwordHash: string
    name: string
    email: string | null
    phone: string | null
  },
): Promise<AuthAccount> {
  const result = await client.query<AccountRow>(
    `INSERT INTO farmers (username, password_hash, name, email, phone, admin_password)
     VALUES ($1, $2, $3, $4, $5, NULL)
     RETURNING id, username, password_hash, name, email, phone, is_active`,
    [input.username, input.passwordHash, input.name, input.email, input.phone],
  )
  return mapAccount(result.rows[0]!, 'farmer')
}

export async function insertFarm(
  client: Db,
  input: {
    userId: string
    name: string
    location: string
    latitude: number
    longitude: number
    acreage: number
    treeCount: number
  },
): Promise<Farm> {
  await ensurePrimaryFarmColumn()
  const result = await client.query<FarmRow>(
    `INSERT INTO farms (user_id, name, location, latitude, longitude, acreage, tree_count)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, location, latitude, longitude, acreage, tree_count`,
    [
      input.userId,
      input.name,
      input.location,
      input.latitude,
      input.longitude,
      input.acreage,
      input.treeCount,
    ],
  )
  const farm = mapFarm(result.rows[0]!, false)
  const existingPrimary = await client.query<{ primary_farm_id: string | null }>(
    `SELECT primary_farm_id FROM farmers WHERE id = $1 LIMIT 1`,
    [input.userId],
  )
  if (!existingPrimary.rows[0]?.primary_farm_id) {
    await client.query(`UPDATE farmers SET primary_farm_id = $1, updated_at = now() WHERE id = $2`, [
      farm.id,
      input.userId,
    ])
    farm.isPrimary = true
  }
  return farm
}

export async function findFarmByIdForUser(farmId: string, userId: string): Promise<Farm | null> {
  const farms = await listFarmsByUserId(userId)
  return farms.find((farm) => farm.id === farmId) ?? null
}

export async function updateFarmForUser(
  farmId: string,
  userId: string,
  input: {
    name: string
    location: string
    latitude: number
    longitude: number
    acreage: number
    treeCount: number
  },
): Promise<Farm | null> {
  const result = await pool.query<FarmRow>(
    `UPDATE farms
     SET name = $3, location = $4, latitude = $5, longitude = $6, acreage = $7, tree_count = $8
     WHERE id = $1 AND user_id = $2
     RETURNING id, name, location, latitude, longitude, acreage, tree_count`,
    [
      farmId,
      userId,
      input.name,
      input.location,
      input.latitude,
      input.longitude,
      input.acreage,
      input.treeCount,
    ],
  )
  const row = result.rows[0]
  if (!row) return null
  const farms = await listFarmsByUserId(userId)
  return farms.find((farm) => farm.id === farmId) ?? mapFarm(row)
}

export async function countFarmDependencies(farmId: string) {
  const reports = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM disease_reports WHERE farm_id = $1`,
    [farmId],
  )
  const alerts = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM disease_alerts WHERE farm_id = $1`,
    [farmId],
  )
  return {
    reports: Number(reports.rows[0]?.count ?? 0),
    alerts: Number(alerts.rows[0]?.count ?? 0),
  }
}

export async function setPrimaryFarmId(userId: string, farmId: string): Promise<void> {
  await ensurePrimaryFarmColumn()
  await pool.query(
    `UPDATE farmers
     SET primary_farm_id = $1, updated_at = now()
     WHERE id = $2`,
    [farmId, userId],
  )
}

export async function deleteFarmForUser(farmId: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM farms
     WHERE id = $1 AND user_id = $2`,
    [farmId, userId],
  )
  return (result.rowCount ?? 0) > 0
}

export async function listFarmsByUserId(userId: string): Promise<Farm[]> {
  await ensurePrimaryFarmColumn()
  const result = await pool.query<FarmRow>(
    `SELECT f.id, f.name, f.location, f.latitude, f.longitude, f.acreage, f.tree_count,
            fa.primary_farm_id
     FROM farms f
     JOIN farmers fa ON fa.id = f.user_id
     WHERE f.user_id = $1
     ORDER BY f.created_at ASC`,
    [userId],
  )

  const storedPrimary = result.rows[0]?.primary_farm_id ?? null
  const hasStoredPrimary = Boolean(
    storedPrimary && result.rows.some((row) => row.id === storedPrimary),
  )
  const primaryId = hasStoredPrimary ? storedPrimary : (result.rows[0]?.id ?? null)

  if (!hasStoredPrimary && primaryId) {
    await pool.query(
      `UPDATE farmers SET primary_farm_id = $1, updated_at = now() WHERE id = $2 AND primary_farm_id IS NULL`,
      [primaryId, userId],
    )
  }

  return result.rows
    .map((row) => mapFarm(row, row.id === primaryId))
    .sort((a, b) => Number(Boolean(b.isPrimary)) - Number(Boolean(a.isPrimary)))
}

export async function updatePassword(
  id: string,
  role: UserRole,
  passwordHash: string,
): Promise<void> {
  const table = ACCOUNT_TABLE[role]
  await pool.query(
    `UPDATE ${table}
     SET password_hash = $1, admin_password = NULL, updated_at = now()
     WHERE id = $2`,
    [passwordHash, id],
  )
}
