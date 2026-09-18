import { forbidden } from '../../utils/errors.js'
import type {
  BroadcastNotification,
  InboxNotification,
  InboxResponse,
  User,
  UserRole,
} from '../../types/index.js'
import { listReportsForUser } from '../diagnosis/diagnosis.repository.js'
import { getAlerts, readAlert, readAllAlerts } from '../diseaseMap/diseaseMap.service.js'
import {
  ensureConsultationSchema,
  listConsultationsForFarmer,
  listConsultationsForRegion,
} from '../consultations/consultations.repository.js'
import { inboxBucket, officerCanAccess } from '../consultations/routing.js'
import {
  audienceMatches,
  encodeNotificationId,
  isUnread,
  parseNotificationId,
  preview,
} from './inbox.js'
import type { CreateBroadcastInput } from './notifications.schemas.js'
import {
  countRecipients,
  ensureNotificationSchema,
  insertBroadcast,
  listBroadcasts,
  listBroadcastsForRole,
  listNotificationState,
  markAllStateRead,
  pendingReportsInRegion,
  upsertNotificationState,
  type BroadcastRow,
  type NotificationStateRow,
} from './notifications.repository.js'

function assertAdmin(role: string) {
  if (role !== 'admin') throw forbidden('Admin access required')
}

async function settle<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    console.error(`Notification source failed (${label}):`, err)
    return fallback
  }
}

function stateMap(rows: NotificationStateRow[]) {
  return new Map(rows.map((row) => [`${row.source}:${row.source_id}`, row]))
}

function hrefFor(role: UserRole, category: InboxNotification['category']) {
  if (role === 'officer') {
    if (category === 'consultation') return `/officer/consultations`
    if (category === 'report') return `/officer/reports`
    return `/officer/notifications`
  }
  if (category === 'outbreak') return '/app/heatmap'
  if (category === 'consultation') return '/app/consultations'
  if (category === 'report') return '/app/disease-detection'
  return '/app/notifications'
}

function mapBroadcast(
  row: BroadcastRow,
  role: UserRole,
  state: NotificationStateRow | undefined,
): InboxNotification | null {
  if (state?.dismissed_at) return null
  const read = !isUnread({
    dismissedAt: state?.dismissed_at,
    readAt: state?.read_at,
    entityUpdatedAt: row.created_at,
    defaultRead: false,
  })
  return {
    id: encodeNotificationId('broadcast', row.id),
    source: 'broadcast',
    kind: 'info',
    category: 'announcement',
    title: row.title,
    message: row.message,
    href: hrefFor(role, 'announcement'),
    read,
    createdAt: row.created_at.toISOString(),
  }
}

async function farmerItems(user: User, states: Map<string, NotificationStateRow>) {
  const items: InboxNotification[] = []

  const broadcasts = await settle('broadcasts', () => listBroadcastsForRole('farmer'), [])
  for (const row of broadcasts) {
    if (!audienceMatches(row.audience, 'farmer')) continue
    const mapped = mapBroadcast(row, 'farmer', states.get(encodeNotificationId('broadcast', row.id)))
    if (mapped) items.push(mapped)
  }

  const alerts = await settle('alerts', () => getAlerts(user.id), [])
  for (const alert of alerts) {
    const key = encodeNotificationId('disease', alert.id)
    const state = states.get(key)
    if (state?.dismissed_at) continue
    const createdAt = new Date(alert.createdAt)
    const read = !isUnread({
      dismissedAt: state?.dismissed_at,
      readAt: state?.read_at,
      entityUpdatedAt: createdAt,
      defaultRead: alert.read,
    })
    items.push({
      id: key,
      source: 'disease',
      kind: alert.alertType === 'verified' ? 'alert' : 'info',
      category: 'outbreak',
      title:
        alert.alertType === 'ai_suspected'
          ? `AI-suspected nearby ${alert.diseaseType}`
          : `Verified nearby ${alert.diseaseType}`,
      message: alert.message,
      href: hrefFor('farmer', 'outbreak'),
      read,
      createdAt: alert.createdAt,
    })
  }

  const reports = await settle('reports', () => listReportsForUser(user.id), [])
  for (const report of reports.slice(0, 20)) {
    const key = encodeNotificationId('report', report.id)
    const state = states.get(key)
    if (state?.dismissed_at) continue
    const createdAt = new Date(report.createdAt)
    const pending = report.status === 'pending'
    const read = !isUnread({
      dismissedAt: state?.dismissed_at,
      readAt: state?.read_at,
      entityUpdatedAt: createdAt,
      defaultRead: !pending,
    })
    const label = report.finalResult ?? report.imageResult ?? 'Disease scan'
    const confidence = `${Math.round(report.confidence * 100)}% confidence`
    items.push({
      id: key,
      source: 'report',
      kind: report.status === 'verified' ? 'success' : pending ? 'info' : 'alert',
      category: 'report',
      title:
        report.status === 'pending'
          ? 'Diagnosis pending review'
          : report.status === 'verified'
            ? 'Report verified'
            : 'Report needs another look',
      message: `${label} — ${confidence}.`,
      href: hrefFor('farmer', 'report'),
      read,
      createdAt: report.createdAt,
    })
  }

  const threads = await settle('consultations', async () => {
    await ensureConsultationSchema()
    return listConsultationsForFarmer(user.id)
  }, [])
  for (const row of threads) {
    if (row.status !== 'open' || row.last_sender !== 'officer') continue
    const key = encodeNotificationId('consultation', row.id)
    const state = states.get(key)
    if (state?.dismissed_at) continue
    const read = !isUnread({
      dismissedAt: state?.dismissed_at,
      readAt: state?.read_at,
      entityUpdatedAt: row.updated_at,
      defaultRead: false,
    })
    items.push({
      id: key,
      source: 'consultation',
      kind: 'message',
      category: 'consultation',
      title: `Officer replied: ${row.topic}`,
      message: preview(row.last_message) || `${row.officer_name ?? 'Your regional officer'} sent an update.`,
      href: hrefFor('farmer', 'consultation'),
      read,
      createdAt: row.updated_at.toISOString(),
    })
  }

  return items
}

async function officerItems(user: User, states: Map<string, NotificationStateRow>) {
  const items: InboxNotification[] = []
  const region = user.assignedRegion?.trim() ?? ''

  const broadcasts = await settle('broadcasts', () => listBroadcastsForRole('officer'), [])
  for (const row of broadcasts) {
    if (!audienceMatches(row.audience, 'officer')) continue
    const mapped = mapBroadcast(row, 'officer', states.get(encodeNotificationId('broadcast', row.id)))
    if (mapped) items.push(mapped)
  }

  if (region) {
    const pending = await settle(
      'pending-reports',
      () => pendingReportsInRegion(region),
      { count: 0, latestAt: null },
    )
    if (pending.count > 0 && pending.latestAt) {
      const key = encodeNotificationId('digest', 'pending-reports')
      const state = states.get(key)
      if (!state?.dismissed_at) {
        const read = !isUnread({
          dismissedAt: state?.dismissed_at,
          readAt: state?.read_at,
          entityUpdatedAt: pending.latestAt,
          defaultRead: false,
        })
        items.push({
          id: key,
          source: 'digest',
          kind: 'alert',
          category: 'report',
          title:
            pending.count === 1
              ? '1 diagnosis needs review'
              : `${pending.count} diagnoses need review`,
          message: `Pending scans in ${region} are waiting for an officer decision.`,
          href: hrefFor('officer', 'report'),
          read,
          createdAt: pending.latestAt.toISOString(),
        })
      }
    }

    const threads = await settle('consultations', async () => {
      await ensureConsultationSchema()
      return listConsultationsForRegion(region)
    }, [])
    for (const row of threads) {
      if (
        !officerCanAccess({
          assignedRegion: region,
          district: row.district,
          officerUserId: user.id,
          assignedOfficerId: row.officer_user_id,
        })
      ) {
        continue
      }
      if (inboxBucket(row.status, row.last_sender) !== 'needs_reply') continue
      const key = encodeNotificationId('consultation', row.id)
      const state = states.get(key)
      if (state?.dismissed_at) continue
      const read = !isUnread({
        dismissedAt: state?.dismissed_at,
        readAt: state?.read_at,
        entityUpdatedAt: row.updated_at,
        defaultRead: false,
      })
      items.push({
        id: key,
        source: 'consultation',
        kind: 'message',
        category: 'consultation',
        title: `${row.farmer_name} needs a reply`,
        message: preview(row.last_message) || `${row.topic} · ${row.district}`,
        href: hrefFor('officer', 'consultation'),
        read,
        createdAt: row.updated_at.toISOString(),
      })
    }
  }

  return items
}

function sortInbox(items: InboxNotification[]) {
  return [...items].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export async function getInbox(user: User): Promise<InboxResponse> {
  await ensureNotificationSchema()
  if (user.role === 'admin') {
    return { items: [], unreadCount: 0 }
  }

  const states = stateMap(await listNotificationState(user.id, user.role))
  const items =
    user.role === 'officer' ? await officerItems(user, states) : await farmerItems(user, states)
  const sorted = sortInbox(items)
  return {
    items: sorted,
    unreadCount: sorted.filter((item) => !item.read).length,
  }
}

export async function markNotificationRead(user: User, id: string) {
  await ensureNotificationSchema()
  const parsed = parseNotificationId(id)
  await upsertNotificationState({
    userId: user.id,
    role: user.role,
    source: parsed.source,
    sourceId: parsed.sourceId,
    read: true,
  })
  if (parsed.source === 'disease' && user.role === 'farmer') {
    try {
      await readAlert(user.id, parsed.sourceId)
    } catch {
      // Alert row may already be gone; inbox state still records the read.
    }
  }
  return { ok: true as const }
}

export async function dismissNotification(user: User, id: string) {
  await ensureNotificationSchema()
  const parsed = parseNotificationId(id)
  await upsertNotificationState({
    userId: user.id,
    role: user.role,
    source: parsed.source,
    sourceId: parsed.sourceId,
    read: true,
    dismiss: true,
  })
  return { ok: true as const }
}

export async function markInboxRead(user: User) {
  await ensureNotificationSchema()
  const inbox = await getInbox(user)
  const unread = inbox.items.filter((item) => !item.read).map((item) => parseNotificationId(item.id))
  await markAllStateRead(user.id, user.role, unread)
  if (user.role === 'farmer') {
    await readAllAlerts(user.id)
  }
  return { ok: true as const, unreadCount: 0 }
}

function mapAdminBroadcast(row: BroadcastRow, recipientEstimate: number): BroadcastNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    audience: row.audience,
    createdBy: row.created_by,
    createdAt: row.created_at.toISOString(),
    recipientEstimate,
  }
}

export async function listAdminBroadcasts(role: string) {
  assertAdmin(role)
  await ensureNotificationSchema()
  const rows = await listBroadcasts()
  const estimates = {
    all: await countRecipients('all'),
    farmers: await countRecipients('farmers'),
    officers: await countRecipients('officers'),
  }
  return rows.map((row) => mapAdminBroadcast(row, estimates[row.audience]))
}

export async function createAdminBroadcast(user: User, input: CreateBroadcastInput) {
  assertAdmin(user.role)
  await ensureNotificationSchema()
  const row = await insertBroadcast({
    title: input.title,
    message: input.message,
    audience: input.audience,
    createdBy: user.id,
  })
  const recipientEstimate = await countRecipients(row.audience)
  return mapAdminBroadcast(row, recipientEstimate)
}

export function assertInboxRole(role: string) {
  if (role !== 'farmer' && role !== 'officer') {
    throw forbidden('Notifications are available to farmers and officers')
  }
}
