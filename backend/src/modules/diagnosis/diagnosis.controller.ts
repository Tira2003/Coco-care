import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { unauthorized } from '../../utils/errors.js'
import { diagnosisBodySchema } from './diagnosis.schemas.js'
import { assertFarmer, runDiagnosis } from './diagnosis.service.js'

export const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw unauthorized()
  assertFarmer(req.user.role)
  const input = diagnosisBodySchema.parse(req.body)
  const result = await runDiagnosis(req.user.id, input)
  res.status(201).json(result)
})
