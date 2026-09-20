import { pool } from '../../db/pool.js'
import { centroidForLocation, DEFAULT_DISTRICT } from '../../constants/districts.js'
import { badRequest, conflict, forbidden, notFound, unauthorized } from '../../utils/errors.js'
import { hashPassword, verifyPassword } from '../../utils/password.js'
import { signToken } from '../../utils/jwt.js'
import type { AuthAccount, Farm, User } from '../../types/index.js'
import type {
  ChangePasswordInput,
  FarmInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from './auth.schemas.js'
import {
  countFarmDependencies,
  deleteFarmForUser,
  emailExists,
  emailTakenByOther,
  findAccountById,
  findAccountByUsername,
  findFarmByIdForUser,
  insertFarm,
  insertFarmer,
  listFarmsByUserId,
  setPrimaryFarmId,
  updateFarmerContact,
  updateOfficerContact,
  updateFarmForUser,
  updatePassword,
  usernameExists,
} from './auth.repository.js'

const NIC_RE = /^([0-9]{9}[vVxX]|[0-9]{12})$/

export function toPublicUser(account: AuthAccount, farms?: Farm[]): User {
  const assignedRegion = account.assignedRegion ?? farms?.[0]?.location ?? undefined
  return {
    id: account.id,
    username: account.username,
    name: account.name,
    email: account.email ?? undefined,
    phone: account.phone ?? undefined,
    role: account.role,
    isActive: account.isActive,
    officerId: account.officerId ?? undefined,
    assignedRegion,
  }
}

function sessionResponse(account: AuthAccount, farms?: Farm[]) {
  return {
    token: signToken(account.id, account.role),
    user: toPublicUser(account, farms),
  }
}

function resolveFarmCoords(farm: FarmInput, fallbackLocation: string) {
  const location = farm.location || fallbackLocation
  const hasCoords =
    typeof farm.latitude === 'number' &&
    typeof farm.longitude === 'number' &&
    !(farm.latitude === 0 && farm.longitude === 0)
  const centroid = centroidForLocation(location)
  return {
    location,
    latitude: hasCoords ? farm.latitude! : centroid.latitude,
    longitude: hasCoords ? farm.longitude! : centroid.longitude,
    acreage: farm.acreage && farm.acreage > 0 ? farm.acreage : 1,
    treeCount: farm.treeCount ?? 0,
    name: farm.name,
  }
}

export async function login(input: LoginInput) {
  const account = await findAccountByUsername(input.username)
  if (!account) {
    throw unauthorized('Invalid username or password')
  }
  if (!account.isActive) {
    throw forbidden('This account has been deactivated')
  }

  const ok = await verifyPassword(input.password, account.passwordHash)
  if (!ok) {
    throw unauthorized('Invalid username or password')
  }

  const farms = account.role === 'farmer' ? await listFarmsByUserId(account.id) : undefined
  return sessionResponse(account, farms)
}

export async function register(input: RegisterInput) {
  if (input.role !== 'farmer') {
    throw forbidden('Public registration is only available for farmers')
  }
  if (!NIC_RE.test(input.username)) {
    throw badRequest('Invalid NIC — use 9 digits + V or 12 digits')
  }

  const username = input.username.toUpperCase()
  if (await usernameExists(username)) {
    throw conflict('An account with this NIC already exists')
  }
  if (input.email && (await emailExists(input.email))) {
    throw conflict('An account with this email already exists')
  }

  const passwordHash = await hashPassword(input.password)
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const account = await insertFarmer(client, {
      username,
      passwordHash,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone,
    })

    const fallbackLocation = input.assignedRegion?.trim() || DEFAULT_DISTRICT
    const farmsToCreate = input.farms?.length
      ? input.farms
      : [
          {
            name: `${input.name}'s Farm`,
            location: fallbackLocation,
          },
        ]

    const farms: Farm[] = []
    for (const farm of farmsToCreate) {
      const resolved = resolveFarmCoords(farm, fallbackLocation)
      farms.push(
        await insertFarm(client, {
          userId: account.id,
          ...resolved,
        }),
      )
    }

    await client.query('COMMIT')
    return sessionResponse(account, farms)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function getMe(userId: string, role: AuthAccount['role']) {
  const account = await findAccountById(userId, role)
  if (!account) {
    throw unauthorized('Invalid or expired token')
  }
  const farms = account.role === 'farmer' ? await listFarmsByUserId(account.id) : undefined
  return toPublicUser(account, farms)
}

export async function changePassword(
  userId: string,
  role: AuthAccount['role'],
  input: ChangePasswordInput,
) {
  const account = await findAccountById(userId, role)
  if (!account) {
    throw unauthorized('Invalid or expired token')
  }

  const ok = await verifyPassword(input.currentPassword, account.passwordHash)
  if (!ok) {
    throw badRequest('Current password is incorrect')
  }

  if (input.currentPassword === input.newPassword) {
    throw badRequest('New password must be different from the current password')
  }

  const nextHash = await hashPassword(input.newPassword)
  await updatePassword(account.id, account.role, nextHash)
  return { ok: true as const }
}

export async function getFarmerProfile(userId: string) {
  const account = await findAccountById(userId, 'farmer')
  if (!account) {
    throw unauthorized('Invalid or expired token')
  }
  const farms = await listFarmsByUserId(account.id)
  return {
    user: toPublicUser(account, farms),
    farms,
  }
}

export async function updateFarmerProfile(userId: string, input: UpdateProfileInput) {
  const account = await findAccountById(userId, 'farmer')
  if (!account) {
    throw unauthorized('Invalid or expired token')
  }

  const name = input.name.trim()
  const email =
    typeof input.email === 'string' && input.email.trim() ? input.email.trim() : null
  const phone =
    typeof input.phone === 'string' && input.phone.trim() ? input.phone.trim() : null

  if (email && (await emailTakenByOther(email, account.id))) {
    throw conflict('An account with this email already exists')
  }

  const updated = await updateFarmerContact(account.id, { name, email, phone })
  if (!updated) {
    throw unauthorized('Invalid or expired token')
  }

  const farms = await listFarmsByUserId(updated.id)
  return toPublicUser(updated, farms)
}

export async function updateOfficerProfile(userId: string, input: UpdateProfileInput) {
  const account = await findAccountById(userId, 'officer')
  if (!account) {
    throw unauthorized('Invalid or expired token')
  }

  const name = input.name.trim()
  const email =
    typeof input.email === 'string' && input.email.trim() ? input.email.trim() : null
  const phone =
    typeof input.phone === 'string' && input.phone.trim() ? input.phone.trim() : null

  if (email && (await emailTakenByOther(email, account.id))) {
    throw conflict('An account with this email already exists')
  }

  const updated = await updateOfficerContact(account.id, { name, email, phone })
  if (!updated) {
    throw unauthorized('Invalid or expired token')
  }

  return toPublicUser(updated)
}

export async function setFarmerPrimaryFarm(userId: string, farmId: string) {
  const farm = await findFarmByIdForUser(farmId, userId)
  if (!farm) {
    throw notFound('Farm not found')
  }
  await setPrimaryFarmId(userId, farmId)
  return listFarmsByUserId(userId)
}

export async function deleteFarmerFarm(userId: string, farmId: string) {
  const farms = await listFarmsByUserId(userId)
  const farm = farms.find((item) => item.id === farmId)
  if (!farm) {
    throw notFound('Farm not found')
  }
  if (farms.length === 1) {
    throw badRequest('Keep at least one farm on your account.')
  }

  const usage = await countFarmDependencies(farmId)
  if (usage.reports > 0 || usage.alerts > 0) {
    throw conflict('This farm has disease reports or alerts, so it cannot be deleted.')
  }

  if (farm.isPrimary) {
    const nextPrimary = farms.find((item) => item.id !== farmId)
    if (nextPrimary) {
      await setPrimaryFarmId(userId, nextPrimary.id)
    }
  }

  const deleted = await deleteFarmForUser(farmId, userId)
  if (!deleted) {
    throw notFound('Farm not found')
  }
  return { ok: true as const }
}

export async function updateFarmerFarm(
  userId: string,
  farmId: string,
  input: {
    name: string
    location: string
    latitude: number
    longitude: number
    acreage: number
    treeCount: number
  },
) {
  const farm = await updateFarmForUser(farmId, userId, input)
  if (!farm) {
    throw notFound('Farm not found')
  }
  return farm
}
