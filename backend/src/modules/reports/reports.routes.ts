import { Router } from 'express'
import type { Request } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { forbidden, unauthorized } from '../../utils/errors.js'
import { listReportsForUser } from '../diagnosis/diagnosis.repository.js'

const router = Router()

function requireFarmer(req: Request) {
  if (!req.user) throw unauthorized()
  if (req.user.role !== 'farmer') throw forbidden('Farmer access required')
  return req.user
}

router.get(
  '/reports/my',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = requireFarmer(req)
    const reports = await listReportsForUser(user.id)
    res.json(reports)
  }),
)

export default router
