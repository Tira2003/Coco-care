import { z } from 'zod'

export const reviewReportSchema = z.object({
  action: z.enum(['verify', 'reject']),
  comment: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => (value ? value : undefined)),
})

export type ReviewReportInput = z.infer<typeof reviewReportSchema>
