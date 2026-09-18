import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { unauthorized } from '../../utils/errors.js'
import { createBroadcastSchema, notificationIdSchema } from './notifications.schemas.js'
import {
  assertInboxRole,
  createAdminBroadcast,
  dismissNotification,
  getInbox,
  listAdminBroadcasts,
  markInboxRead,
  markNotificationRead,
} from './notifications.service.js'

function currentUser(req: Request) {
  if (!req.user) throw unauthorized()
  return req.user
}

function inboxUser(req: Request) {
  const user = currentUser(req)
  assertInboxRole(user.role)
  return user
}

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  const user = inboxUser(req)
  res.json(await getInbox(user))
})

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const user = inboxUser(req)
  const id = req.params.id
    ? String(req.params.id)
    : notificationIdSchema.parse(req.body).id
  res.json(await markNotificationRead(user, id))
})

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  const user = inboxUser(req)
  res.json(await markInboxRead(user))
})

export const dismiss = asyncHandler(async (req: Request, res: Response) => {
  const user = inboxUser(req)
  const { id } = notificationIdSchema.parse({
    id: req.params.id ? String(req.params.id) : req.body?.id,
  })
  res.json(await dismissNotification(user, id))
})

export const adminList = asyncHandler(async (req: Request, res: Response) => {
  const user = currentUser(req)
  res.json(await listAdminBroadcasts(user.role))
})

export const adminCreate = asyncHandler(async (req: Request, res: Response) => {
  const user = currentUser(req)
  const input = createBroadcastSchema.parse(req.body)
  res.status(201).json(await createAdminBroadcast(user, input))
})
