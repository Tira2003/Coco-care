import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { forbidden, unauthorized } from '../../utils/errors.js'
import { getFarmerProfile } from '../auth/auth.service.js'

const router = Router()

router.get(
  '/farmers/profile',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) throw unauthorized()
    if (req.user.role !== 'farmer') throw forbidden('Farmer access required')
    const profile = await getFarmerProfile(req.user.id)
    res.json(profile)
  }),
)

export default router
