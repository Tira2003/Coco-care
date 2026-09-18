import { Router } from 'express'
import type { Request } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { forbidden, notFound, unauthorized } from '../../utils/errors.js'
import { pool } from '../../db/pool.js'
import { centroidForLocation } from '../../constants/districts.js'
import { getFarmerProfile } from '../auth/auth.service.js'
import {
  deleteFarmForUser,
  insertFarm,
  updateFarmForUser,
} from '../auth/auth.repository.js'
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
    const farm = await updateFarmForUser(farmId, user.id, input)
    if (!farm) throw notFound('Farm not found')
    res.json(farm)
  }),
)

router.delete(
  '/farms/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = requireFarmer(req)
    const farmId = String(req.params.id)
    const deleted = await deleteFarmForUser(farmId, user.id)
    if (!deleted) throw notFound('Farm not found')
    res.json({ ok: true })
  }),
)

export default router
