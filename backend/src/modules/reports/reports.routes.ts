import { Router } from 'express'
import type { Request } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { forbidden, unauthorized } from '../../utils/errors.js'
import { listReportsForUser } from '../diagnosis/diagnosis.repository.js'
import { reviewReportSchema } from './reports.schemas.js'
import {
  assertOfficer,
  listOfficerPending,
  listOfficerVerified,
  reviewOfficerReport,
} from './officerReports.service.js'

const router = Router()

function requireFarmer(req: Request) {
  if (!req.user) throw unauthorized()
  if (req.user.role !== 'farmer') throw forbidden('Farmer access required')
  return req.user
}

function requireOfficer(req: Request) {
  if (!req.user) throw unauthorized()
  assertOfficer(req.user.role)
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

router.get(
  '/officer/reports/pending',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = requireOfficer(req)
    res.json(await listOfficerPending(user.assignedRegion))
  }),
)

router.get(
  '/officer/reports/verified',
  requireAuth,
  asyncHandler(async (req, res) => {
    requireOfficer(req)
    res.json(await listOfficerVerified())
  }),
)

router.post(
  '/officer/reports/:id/review',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = requireOfficer(req)
    const input = reviewReportSchema.parse(req.body)
    res.json(await reviewOfficerReport(user.id, user.assignedRegion, String(req.params.id), input))
  }),
)

export default router
