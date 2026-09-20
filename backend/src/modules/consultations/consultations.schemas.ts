import { z } from 'zod'

const optionalUuid = z
  .union([z.string().uuid(), z.literal('')])
  .optional()
  .transform((value) => (value ? value : undefined))

export const consultationAttachmentSchema = z.object({
  kind: z.enum(['image', 'video', 'voice']),
  url: z
    .string()
    .trim()
    .min(1, 'Media is missing')
    .max(10_000_000, 'That file is too large to send'),
  name: z.string().trim().min(1).max(120),
  mime: z.string().trim().min(3).max(80),
})

export const consultationAttachmentsSchema = z
  .array(consultationAttachmentSchema)
  .max(3, 'You can attach up to 3 files')
  .default([])

function requireNoteOrMedia(
  data: { message?: string; content?: string; attachments: { kind: string }[] },
  ctx: z.RefinementCtx,
  path: 'message' | 'content',
) {
  const text = (data.message ?? data.content ?? '').trim()
  if (text || data.attachments.length > 0) return
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    path: [path],
    message: 'Write a note or attach a photo, video, or voice note',
  })
}

export const createConsultationSchema = z
  .object({
    topic: z.string().trim().min(3, 'Choose a topic').max(80),
    message: z.string().trim().max(4000).default(''),
    farmId: optionalUuid,
    reportId: optionalUuid,
    attachments: consultationAttachmentsSchema,
  })
  .superRefine((data, ctx) => requireNoteOrMedia(data, ctx, 'message'))

export const consultationMessageSchema = z
  .object({
    content: z.string().trim().max(4000).default(''),
    attachments: consultationAttachmentsSchema,
  })
  .superRefine((data, ctx) => requireNoteOrMedia(data, ctx, 'content'))

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>
export type ConsultationMessageInput = z.infer<typeof consultationMessageSchema>
export type ConsultationAttachmentInput = z.infer<typeof consultationAttachmentSchema>
