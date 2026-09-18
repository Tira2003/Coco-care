export type ConsultationStatus = 'open' | 'resolved'
export type LastSender = 'farmer' | 'officer'
export type ConsultationInboxBucket = 'needs_reply' | 'waiting' | 'resolved'

export function normalizeRegion(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase()
}

export function regionsMatch(
  assignedRegion: string | null | undefined,
  district: string | null | undefined,
) {
  const left = normalizeRegion(assignedRegion)
  const right = normalizeRegion(district)
  return Boolean(left && right && left === right)
}

export function inboxBucket(
  status: ConsultationStatus,
  lastSender: LastSender,
): ConsultationInboxBucket {
  if (status === 'resolved') return 'resolved'
  if (lastSender === 'farmer') return 'needs_reply'
  return 'waiting'
}

export function officerCanAccess(input: {
  assignedRegion: string | null | undefined
  district: string
  officerUserId: string
  assignedOfficerId: string | null
}) {
  if (input.assignedOfficerId === input.officerUserId) return true
  return regionsMatch(input.assignedRegion, input.district)
}

export function pickRegionalOfficer<T extends { id: string; name: string; openCount: number }>(
  officers: T[],
): T | null {
  if (officers.length === 0) return null
  return [...officers].sort((a, b) => {
    if (a.openCount !== b.openCount) return a.openCount - b.openCount
    return a.name.localeCompare(b.name)
  })[0] ?? null
}
