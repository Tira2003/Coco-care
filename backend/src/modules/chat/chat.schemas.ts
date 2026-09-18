import { z } from 'zod'

export const sendChatSchema = z.object({
  conversationId: z.string().uuid('Start a conversation before sending a message'),
  message: z.string().trim().min(1, 'Please enter a question').max(4000),
})

export type SendChatInput = z.infer<typeof sendChatSchema>
