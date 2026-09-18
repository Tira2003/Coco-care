import { badRequest, forbidden, notFound } from '../../utils/errors.js'
import { findFarmByIdForUser, listFarmsByUserId } from '../auth/auth.repository.js'
import type {
  ConsultationMessage,
  ConsultationSummary,
  ConsultationThread,
} from '../../types/index.js'
import type { CreateConsultationInput } from './consultations.schemas.js'
import {
  ensureConsultationSchema,
  findOwnedReport,
  getConsultationById,
  insertConsultation,
  insertReply,
  listConsultationsForFarmer,
  listConsultationsForRegion,
  listMessages,
  listRegionalOfficers,
  markResolved,
  type ConsultationRow,
} from './consultations.repository.js'
import {
  inboxBucket,
  officerCanAccess,
  pickRegionalOfficer,
  type LastSender,
} from './routing.js'

export function assertFarmer(role: string) {
  if (role !== 'farmer') throw forbidden('Farmer access required')
}

export function assertOfficer(role: string) {
  if (role !== 'officer') throw forbidden('Officer access required')
}

function preview(text: string | null) {
  if (!text) return ''
  const compact = text.replace(/\s+/g, ' ').trim()
  return compact.length <= 90 ? compact : `${compact.slice(0, 87).trim()}...`
}

function mapSummary(row: ConsultationRow): ConsultationSummary {
  return {
    id: row.id,
    topic: row.topic,
    status: row.status,
    lastSender: row.last_sender,
    inbox: inboxBucket(row.status, row.last_sender),
    district: row.district,
    farmId: row.farm_id ?? undefined,
    farmName: row.farm_name ?? undefined,
    reportId: row.report_id ?? undefined,
    reportLabel: row.report_label ?? undefined,
    farmerName: row.farmer_name,
    officerName: row.officer_name ?? undefined,
    lastMessage: preview(row.last_message),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  }
}

function mapMessage(row: {
  id: string
  consultation_id: string
  sender_role: LastSender
  sender_user_id: string
  content: string
  created_at: Date
}): ConsultationMessage {
  return {
    id: row.id,
    consultationId: row.consultation_id,
    senderRole: row.sender_role,
    senderUserId: row.sender_user_id,
    content: row.content,
    createdAt: row.created_at.toISOString(),
  }
}

async function toThread(row: ConsultationRow): Promise<ConsultationThread> {
  const messages = await listMessages(row.id)
  return {
    ...mapSummary(row),
    farmerPhone: row.farmer_phone ?? undefined,
    reportStatus: row.report_status ?? undefined,
    messages: messages.map(mapMessage),
  }
}

async function loadForFarmer(farmerUserId: string, id: string) {
  const row = await getConsultationById(id)
  if (!row || row.farmer_user_id !== farmerUserId) throw notFound('Consultation not found')
  return row
}

async function loadForOfficer(
  officerUserId: string,
  assignedRegion: string | null | undefined,
  id: string,
) {
  const row = await getConsultationById(id)
  if (
    !row ||
    !officerCanAccess({
      assignedRegion,
      district: row.district,
      officerUserId,
      assignedOfficerId: row.officer_user_id,
    })
  ) {
    throw notFound('Consultation not found')
  }
  return row
}

export async function listFarmerConsultations(farmerUserId: string) {
  await ensureConsultationSchema()
  const rows = await listConsultationsForFarmer(farmerUserId)
  return rows.map(mapSummary)
}

export async function listOfficerConsultations(
  officerUserId: string,
  assignedRegion: string | null | undefined,
) {
  await ensureConsultationSchema()
  if (!assignedRegion?.trim()) return []
  const rows = await listConsultationsForRegion(assignedRegion)
  return rows
    .filter((row) =>
      officerCanAccess({
        assignedRegion,
        district: row.district,
        officerUserId,
        assignedOfficerId: row.officer_user_id,
      }),
    )
    .map(mapSummary)
}

export async function getFarmerConsultation(farmerUserId: string, id: string) {
  await ensureConsultationSchema()
  return toThread(await loadForFarmer(farmerUserId, id))
}

export async function getOfficerConsultation(
  officerUserId: string,
  assignedRegion: string | null | undefined,
  id: string,
) {
  await ensureConsultationSchema()
  return toThread(await loadForOfficer(officerUserId, assignedRegion, id))
}

export async function createFarmerConsultation(
  farmerUserId: string,
  input: CreateConsultationInput,
) {
  await ensureConsultationSchema()

  let farmId = input.farmId
  let reportId = input.reportId ?? null
  let district = ''

  if (reportId) {
    const report = await findOwnedReport(reportId, farmerUserId)
    if (!report) throw notFound('Diagnosis not found')
    farmId = farmId ?? report.farm_id
    if (farmId !== report.farm_id) {
      throw badRequest('Attach the diagnosis from the same farm as this request')
    }
    district = report.location
  }

  if (farmId) {
    const farm = await findFarmByIdForUser(farmId, farmerUserId)
    if (!farm) throw notFound('Farm not found')
    district = farm.location
  } else {
    const farms = await listFarmsByUserId(farmerUserId)
    const farm = farms[0]
    if (!farm) {
      throw badRequest('Add a farm first so we can route this to your district officer')
    }
    farmId = farm.id
    district = farm.location
  }

  const officer = pickRegionalOfficer(await listRegionalOfficers(district))
  const id = await insertConsultation({
    farmerUserId,
    officerUserId: officer?.id ?? null,
    farmId: farmId ?? null,
    reportId,
    district,
    topic: input.topic,
    message: input.message,
  })
  return getFarmerConsultation(farmerUserId, id)
}

export async function replyAsFarmer(farmerUserId: string, id: string, content: string) {
  await ensureConsultationSchema()
  await loadForFarmer(farmerUserId, id)
  await insertReply({
    consultationId: id,
    senderRole: 'farmer',
    senderUserId: farmerUserId,
    content,
  })
  return getFarmerConsultation(farmerUserId, id)
}

export async function replyAsOfficer(
  officerUserId: string,
  assignedRegion: string | null | undefined,
  id: string,
  content: string,
) {
  await ensureConsultationSchema()
  if (!assignedRegion?.trim()) throw forbidden('No region assigned')
  await loadForOfficer(officerUserId, assignedRegion, id)
  await insertReply({
    consultationId: id,
    senderRole: 'officer',
    senderUserId: officerUserId,
    content,
    officerUserId,
  })
  return getOfficerConsultation(officerUserId, assignedRegion, id)
}

export async function resolveAsFarmer(farmerUserId: string, id: string) {
  await ensureConsultationSchema()
  await loadForFarmer(farmerUserId, id)
  await markResolved(id)
  return getFarmerConsultation(farmerUserId, id)
}

export async function resolveAsOfficer(
  officerUserId: string,
  assignedRegion: string | null | undefined,
  id: string,
) {
  await ensureConsultationSchema()
  if (!assignedRegion?.trim()) throw forbidden('No region assigned')
  await loadForOfficer(officerUserId, assignedRegion, id)
  await markResolved(id)
  return getOfficerConsultation(officerUserId, assignedRegion, id)
}
