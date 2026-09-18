import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { unauthorized } from '../../utils/errors.js'
import { sendChatSchema } from './chat.schemas.js'
import {
  assertFarmer,
  getConversations,
  getMessages,
  removeConversation,
  sendMessage,
  startConversation,
} from './chat.service.js'

function farmer(req: Request) {
  if (!req.user) throw unauthorized()
  assertFarmer(req.user.role)
  return req.user
}

export const list = asyncHandler(async (req: Request, res: Response) => {
  const user = farmer(req)
  res.json(await getConversations(user.id))
})

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = farmer(req)
  res.status(201).json(await startConversation(user.id))
})

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const user = farmer(req)
  await removeConversation(user.id, String(req.params.id))
  res.json({ ok: true })
})

export const messages = asyncHandler(async (req: Request, res: Response) => {
  const user = farmer(req)
  res.json(await getMessages(user.id, String(req.params.id)))
})

export const send = asyncHandler(async (req: Request, res: Response) => {
  const user = farmer(req)
  const input = sendChatSchema.parse(req.body)
  res.status(201).json(await sendMessage(user.id, input))
})
