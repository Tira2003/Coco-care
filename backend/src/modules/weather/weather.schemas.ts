import { z } from 'zod'

export const weatherQuerySchema = z.object({
  farmId: z.string().uuid().optional(),
  lat: z.coerce.number().finite().optional(),
  lon: z.coerce.number().finite().optional(),
  location: z.string().trim().max(100).optional(),
})

export type WeatherQuery = z.infer<typeof weatherQuerySchema>

export const farmBodySchema = z.object({
  name: z.string().trim().min(1, 'Farm name is required').max(100),
  location: z.string().trim().min(1, 'Farm location is required').max(100),
  latitude: z.number().finite(),
  longitude: z.number().finite(),
  acreage: z.number().finite().nonnegative(),
  treeCount: z.number().int().nonnegative(),
})

export type FarmBody = z.infer<typeof farmBodySchema>
