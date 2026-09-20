import { Router } from 'express'
import type { Request } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { forbidden, unauthorized } from '../../utils/errors.js'
import { pool } from '../../db/pool.js'
import { centroidForLocation } from '../../constants/districts.js'
import {
  changePassword as changeAccountPassword,
  deleteFarmerFarm,
  getFarmerProfile,
  setFarmerPrimaryFarm,
  updateFarmerFarm,
  updateFarmerProfile,
} from '../auth/auth.service.js'
import { insertFarm } from '../auth/auth.repository.js'
import {
  changePasswordSchema,
  setPrimaryFarmSchema,
  updateProfileSchema,
} from '../auth/auth.schemas.js'
import { farmBodySchema } from '../weather/weather.schemas.js'

const router = Router()

function requireFarmer(req: Request) {
  if (!req.user) throw unauthorized()
  if (req.user.role !== 'farmer') throw forbidden('Farmer access required')
  return req.user
}

router.get(
  '/farmers/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = requireFarmer(req)
    const profile = await getFarmerProfile(user.id)
    res.json(profile)
  }),
)

router.patch(
  '/farmers/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = requireFarmer(req)
    const input = updateProfileSchema.parse(req.body)
    const updated = await updateFarmerProfile(user.id, input)
    res.json(updated)
  }),
)

router.patch(
  '/farmers/password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = requireFarmer(req)
    const input = changePasswordSchema.parse(req.body)
    const result = await changeAccountPassword(user.id, user.role, input)
    res.json(result)
  }),
)

router.patch(
  '/farmers/primary-farm',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = requireFarmer(req)
    const input = setPrimaryFarmSchema.parse(req.body)
    const farms = await setFarmerPrimaryFarm(user.id, input.farmId)
    res.json({ farms })
  }),
)

router.post(
  '/farms',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = requireFarmer(req)
    const input = farmBodySchema.parse(req.body)
    const coords =
      input.latitude === 0 && input.longitude === 0
        ? centroidForLocation(input.location)
        : { latitude: input.latitude, longitude: input.longitude }
    const farm = await insertFarm(pool, {
      userId: user.id,
      name: input.name,
      location: input.location,
      latitude: coords.latitude,
      longitude: coords.longitude,
      acreage: input.acreage,
      treeCount: input.treeCount,
    })
    res.status(201).json(farm)
  }),
)

router.patch(
  '/farms/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = requireFarmer(req)
    const input = farmBodySchema.parse(req.body)
    const farmId = String(req.params.id)
    const coords =
      input.latitude === 0 && input.longitude === 0
        ? centroidForLocation(input.location)
        : { latitude: input.latitude, longitude: input.longitude }
    const farm = await updateFarmerFarm(user.id, farmId, {
      name: input.name,
      location: input.location,
      latitude: coords.latitude,
      longitude: coords.longitude,
      acreage: input.acreage,
      treeCount: input.treeCount,
    })
    res.json(farm)
  }),
)

router.delete(
  '/farms/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = requireFarmer(req)
    const farmId = String(req.params.id)
    const result = await deleteFarmerFarm(user.id, farmId)
    res.json(result)
  }),
)

export default router
