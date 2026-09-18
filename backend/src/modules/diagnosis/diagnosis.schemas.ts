import { z } from 'zod'
import { DIAGNOSIS_CATEGORIES } from '../../constants/diagnosisCategories.js'

export const diagnosisBodySchema = z.object({
  farmId: z.string().uuid('Select a farm for this diagnosis'),
  category: z.enum(DIAGNOSIS_CATEGORIES).default('leaves'),
  imageUrl: z.string().trim().max(12_000_000).optional(),
  symptoms: z.record(z.string(), z.union([z.string(), z.boolean()])).default({}),
  notes: z.string().trim().max(2000).optional(),
})

export type DiagnosisBody = z.infer<typeof diagnosisBodySchema>
