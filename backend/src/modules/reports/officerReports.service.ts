import { forbidden, notFound } from '../../utils/errors.js'
import type { DiseaseReport } from '../../types/index.js'
import { regionsMatch } from '../consultations/routing.js'
import {
  getReportById,
  listPendingReportsByRegion,
  listVerifiedReports,
  reviewDiseaseReport,
} from '../diagnosis/diagnosis.repository.js'
import { notifyNearbyOfVerifiedReport } from '../diseaseMap/diseaseMap.service.js'
import type { ReviewReportInput } from './reports.schemas.js'

export function assertOfficer(role: string) {
  if (role !== 'officer') throw forbidden('Officer access required')
}

export async function listOfficerPending(assignedRegion: string | null | undefined) {
  if (!assignedRegion?.trim()) throw forbidden('No region assigned')
  return listPendingReportsByRegion(assignedRegion.trim())
}

export async function listOfficerVerified() {
  return listVerifiedReports()
}

export async function reviewOfficerReport(
  officerId: string,
  assignedRegion: string | null | undefined,
  id: string,
  input: ReviewReportInput,
): Promise<DiseaseReport> {
  if (!assignedRegion?.trim()) throw forbidden('No region assigned')

  const report = await getReportById(id)
  if (!report) throw notFound('Report not found')
  if (report.status !== 'pending') {
    throw forbidden('This report has already been reviewed')
  }
  if (!regionsMatch(assignedRegion, report.region)) {
    throw forbidden('This report is outside your assigned region')
  }

  const comment = input.comment
  const status = input.action === 'verify' ? 'verified' : 'rejected'
  const updated = await reviewDiseaseReport(id, {
    status,
    comment,
    advice: input.action === 'verify' && comment ? comment : undefined,
    officerId,
  })
  if (!updated) throw notFound('Report not found')

  if (status === 'verified') {
    await notifyNearbyOfVerifiedReport(updated.id)
  }

  return updated
}
