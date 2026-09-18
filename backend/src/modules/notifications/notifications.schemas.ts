import { z } from 'zod'

export const createBroadcastSchema = z.object({
  title: z.string().trim().min(3, 'Enter a title').max(80),
  message: z.string().trim().min(8, 'Write a short message').max(2000),
  audience: z.enum(['all', 'farmers', 'officers']).default('all'),
})

export const notificationIdSchema = z.object({
  id: z.string().trim().min(1, 'Notification id required').max(120),
})

export type CreateBroadcastInput = z.infer<typeof createBroadcastSchema>
