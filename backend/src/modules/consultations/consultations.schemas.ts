import { z } from 'zod'

const optionalUuid = z
  .union([z.string().uuid(), z.literal('')])
  .optional()
  .transform((value) => (value ? value : undefined))

export const createConsultationSchema = z.object({
  topic: z.string().trim().min(3, 'Choose a topic').max(80),
  message: z.string().trim().min(8, 'Write a short note for the officer').max(4000),
  farmId: optionalUuid,
  reportId: optionalUuid,
})

export const consultationMessageSchema = z.object({
  content: z.string().trim().min(1, 'Enter a message').max(4000),
})

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>
export type ConsultationMessageInput = z.infer<typeof consultationMessageSchema>
