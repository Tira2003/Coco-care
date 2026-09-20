import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { unauthorized } from '../../utils/errors.js'
import { heatmapQuerySchema, nearbyQuerySchema } from './diseaseMap.schemas.js'
import {
  assertFarmer,
  getAlerts,
  getHeatmap,
  getNearby,
  getPublicHeatmap,
  getStats,
  readAlert,
} from './diseaseMap.service.js'

function farmer(req: Request) {
  if (!req.user) throw unauthorized()
  assertFarmer(req.user.role)
  return req.user
}

export const publicHeatmap = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await getPublicHeatmap())
})

export const heatmap = asyncHandler(async (req: Request, res: Response) => {
  farmer(req)
  const filters = heatmapQuerySchema.parse(req.query)
  res.json(await getHeatmap(filters))
})

export const nearby = asyncHandler(async (req: Request, res: Response) => {
  const user = farmer(req)
  const query = nearbyQuerySchema.parse(req.query)
  res.json(await getNearby(user.id, query))
})

export const alerts = asyncHandler(async (req: Request, res: Response) => {
  const user = farmer(req)
  res.json(await getAlerts(user.id))
})

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const user = farmer(req)
  res.json(await readAlert(user.id, String(req.params.id)))
})

export const stats = asyncHandler(async (req: Request, res: Response) => {
  farmer(req)
  const filters = heatmapQuerySchema.parse(req.query)
  res.json(await getStats(filters))
})
