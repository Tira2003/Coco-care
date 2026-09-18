import { z } from 'zod'

function blankToUndefined(value: unknown) {
  if (value == null) return undefined
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw === 'string' && raw.trim() === '') return undefined
  return raw
}

function toDateOnly(value: unknown) {
  const raw = blankToUndefined(value)
  if (raw == null) return undefined
  const match = String(raw).trim().match(/^(\d{4}-\d{2}-\d{2})/)
  return match?.[1]
}

const dateOnly = z.preprocess(toDateOnly, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional())

export const heatmapQuerySchema = z.object({
  diseaseType: z.preprocess(blankToUndefined, z.string().trim().max(200).optional()),
  district: z.preprocess(blankToUndefined, z.string().trim().max(100).optional()),
  minWeight: z.preprocess((value) => {
    const raw = blankToUndefined(value)
    if (raw == null) return undefined
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : raw
  }, z.number().min(0).max(1).optional()),
  from: dateOnly,
  to: dateOnly,
})

export const nearbyQuerySchema = z.object({
  radiusKm: z.coerce.number().min(1).max(250).optional(),
  farmId: z.string().uuid().optional(),
})

export type HeatmapQuery = z.infer<typeof heatmapQuerySchema>
export type NearbyQuery = z.infer<typeof nearbyQuerySchema>
