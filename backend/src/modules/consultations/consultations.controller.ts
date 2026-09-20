import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { unauthorized } from '../../utils/errors.js'
import {
  consultationMessageSchema,
  createConsultationSchema,
} from './consultations.schemas.js'
import {
  assertFarmer,
  assertOfficer,
  createFarmerConsultation,
  deleteAsFarmer,
  deleteAsOfficer,
  getFarmerConsultation,
  getOfficerConsultation,
  listFarmerConsultations,
  listOfficerConsultations,
  replyAsFarmer,
  replyAsOfficer,
  resolveAsFarmer,
  resolveAsOfficer,
} from './consultations.service.js'

function farmer(req: Request) {
  if (!req.user) throw unauthorized()
  assertFarmer(req.user.role)
  return req.user
}

function officer(req: Request) {
  if (!req.user) throw unauthorized()
  assertOfficer(req.user.role)
  return req.user
}

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  const user = farmer(req)
  res.json(await listFarmerConsultations(user.id))
})

export const getMine = asyncHandler(async (req: Request, res: Response) => {
  const user = farmer(req)
  res.json(await getFarmerConsultation(user.id, String(req.params.id)))
})

export const createMine = asyncHandler(async (req: Request, res: Response) => {
  const user = farmer(req)
  const input = createConsultationSchema.parse(req.body)
  res.status(201).json(await createFarmerConsultation(user.id, input))
})

export const replyMine = asyncHandler(async (req: Request, res: Response) => {
  const user = farmer(req)
  const input = consultationMessageSchema.parse(req.body)
  res.status(201).json(await replyAsFarmer(user.id, String(req.params.id), input))
})

export const resolveMine = asyncHandler(async (req: Request, res: Response) => {
  const user = farmer(req)
  res.json(await resolveAsFarmer(user.id, String(req.params.id)))
})

export const deleteMine = asyncHandler(async (req: Request, res: Response) => {
  const user = farmer(req)
  await deleteAsFarmer(user.id, String(req.params.id))
  res.status(204).send()
})

export const listInbox = asyncHandler(async (req: Request, res: Response) => {
  const user = officer(req)
  res.json(await listOfficerConsultations(user.id, user.assignedRegion))
})

export const getInbox = asyncHandler(async (req: Request, res: Response) => {
  const user = officer(req)
  res.json(await getOfficerConsultation(user.id, user.assignedRegion, String(req.params.id)))
})

export const replyInbox = asyncHandler(async (req: Request, res: Response) => {
  const user = officer(req)
  const input = consultationMessageSchema.parse(req.body)
  res.status(201).json(
    await replyAsOfficer(user.id, user.assignedRegion, String(req.params.id), input),
  )
})

export const resolveInbox = asyncHandler(async (req: Request, res: Response) => {
  const user = officer(req)
  res.json(await resolveAsOfficer(user.id, user.assignedRegion, String(req.params.id)))
})

export const deleteInbox = asyncHandler(async (req: Request, res: Response) => {
  const user = officer(req)
  await deleteAsOfficer(user.id, user.assignedRegion, String(req.params.id))
  res.status(204).send()
})
