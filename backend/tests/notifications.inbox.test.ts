import {
  audienceMatches,
  encodeNotificationId,
  isUnread,
  parseNotificationId,
  preview,
} from '../src/modules/notifications/inbox.js'

describe('notification inbox helpers', () => {
  it('encodes and parses source ids', () => {
    const id = encodeNotificationId('consultation', 'abc-123')
    expect(id).toBe('consultation:abc-123')
    expect(parseNotificationId(id)).toEqual({ source: 'consultation', sourceId: 'abc-123' })
  })

  it('treats a bare uuid as a legacy broadcast id', () => {
    expect(parseNotificationId('11111111-2222-3333-4444-555555555555')).toEqual({
      source: 'broadcast',
      sourceId: '11111111-2222-3333-4444-555555555555',
    })
  })

  it('matches broadcast audiences to roles', () => {
    expect(audienceMatches('all', 'farmer')).toBe(true)
    expect(audienceMatches('farmers', 'farmer')).toBe(true)
    expect(audienceMatches('officers', 'farmer')).toBe(false)
    expect(audienceMatches('officers', 'officer')).toBe(true)
  })

  it('reopens a thread after a newer update even if it was marked read', () => {
    const readAt = new Date('2026-09-18T10:00:00Z')
    const later = new Date('2026-09-18T11:00:00Z')
    expect(
      isUnread({
        readAt,
        entityUpdatedAt: later,
        defaultRead: false,
      }),
    ).toBe(true)
    expect(
      isUnread({
        readAt,
        entityUpdatedAt: new Date('2026-09-18T09:00:00Z'),
        defaultRead: false,
      }),
    ).toBe(false)
  })

  it('shortens long preview text', () => {
    expect(preview('A much longer officer note about the grove', 18)).toMatch(/\.\.\.$/)
  })
})
