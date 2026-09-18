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
}

const ACCOUNT_TABLE: Record<UserRole, 'farmers' | 'officers' | 'admins'> = {
  farmer: 'farmers',
  officer: 'officers',
  admin: 'admins',
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

export function mapFarm(row: FarmRow): Farm {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    acreage: Number(row.acreage),
    treeCount: row.tree_count,
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
  return mapFarm(result.rows[0]!)
}

export async function findFarmByIdForUser(farmId: string, userId: string): Promise<Farm | null> {
  const result = await pool.query<FarmRow>(
    `SELECT id, name, location, latitude, longitude, acreage, tree_count
     FROM farms
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [farmId, userId],
  )
  const row = result.rows[0]
  return row ? mapFarm(row) : null
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
  return row ? mapFarm(row) : null
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
  const result = await pool.query<FarmRow>(
    `SELECT id, name, location, latitude, longitude, acreage, tree_count
     FROM farms
     WHERE user_id = $1
     ORDER BY created_at ASC`,
    [userId],
  )
  return result.rows.map(mapFarm)
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
