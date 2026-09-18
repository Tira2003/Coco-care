import type { InboxSource } from '../../types/index.js'

const SOURCES: InboxSource[] = ['broadcast', 'disease', 'report', 'consultation', 'digest']

export function encodeNotificationId(source: InboxSource, sourceId: string) {
  return `${source}:${sourceId}`
}

export function parseNotificationId(id: string): { source: InboxSource; sourceId: string } {
  const idx = id.indexOf(':')
  if (idx <= 0 || idx === id.length - 1) {
    return { source: 'broadcast', sourceId: id }
  }
  const source = id.slice(0, idx)
  const sourceId = id.slice(idx + 1)
  if (!SOURCES.includes(source as InboxSource) || !sourceId) {
    return { source: 'broadcast', sourceId: id }
  }
  return { source: source as InboxSource, sourceId }
}

export function audienceMatches(audience: string, role: string) {
  if (audience === 'all') return true
  if (audience === 'farmers') return role === 'farmer'
  if (audience === 'officers') return role === 'officer'
  return false
}

export function isUnread(input: {
  dismissedAt?: Date | null
  readAt?: Date | null
  entityUpdatedAt: Date
  defaultRead: boolean
}) {
  if (input.dismissedAt) return false
  if (input.readAt) return input.readAt.getTime() < input.entityUpdatedAt.getTime()
  return !input.defaultRead
}

export function preview(text: string | null | undefined, max = 140) {
  if (!text) return ''
  const compact = text.replace(/\s+/g, ' ').trim()
  return compact.length <= max ? compact : `${compact.slice(0, max - 3).trim()}...`
}
