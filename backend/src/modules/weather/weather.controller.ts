import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { forbidden, unauthorized } from '../../utils/errors.js'
import { weatherQuerySchema } from './weather.schemas.js'
import { getForecast, resolveFarmWeatherQuery } from './weather.service.js'

export const forecast = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw unauthorized()
  if (req.user.role !== 'farmer') throw forbidden('Farmer access required')

  const query = weatherQuerySchema.parse(req.query)
  const resolved = await resolveFarmWeatherQuery(req.user.id, query)
  const data = await getForecast(resolved)
  res.json({
    ...data,
    location: resolved.farm?.name
      ? `${resolved.farm.name} · ${data.location}`
      : data.location,
  })
})
