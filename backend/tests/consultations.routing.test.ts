import {
  inboxBucket,
  officerCanAccess,
  pickRegionalOfficer,
  regionsMatch,
} from '../src/modules/consultations/routing.js'

describe('officer consultation routing', () => {
  it('matches districts without worrying about spacing or case', () => {
    expect(regionsMatch(' Kurunegala ', 'kurunegala')).toBe(true)
    expect(regionsMatch('Puttalam', 'Gampaha')).toBe(false)
    expect(regionsMatch('', 'Kurunegala')).toBe(false)
  })

  it('puts farmer-last open threads in the officer needs-reply bucket', () => {
    expect(inboxBucket('open', 'farmer')).toBe('needs_reply')
    expect(inboxBucket('open', 'officer')).toBe('waiting')
    expect(inboxBucket('resolved', 'farmer')).toBe('resolved')
  })

  it('lets an officer see a thread in their assigned district', () => {
    expect(
      officerCanAccess({
        assignedRegion: 'Kurunegala',
        district: 'Kurunegala',
        officerUserId: 'o1',
        assignedOfficerId: 'o2',
      }),
    ).toBe(true)
  })

  it('lets the assigned officer see a thread even if the district label drifted', () => {
    expect(
      officerCanAccess({
        assignedRegion: 'Gampaha',
        district: 'Colombo',
        officerUserId: 'o1',
        assignedOfficerId: 'o1',
      }),
    ).toBe(true)
  })

  it('picks the regional officer with the lightest open caseload', () => {
    const picked = pickRegionalOfficer([
      { id: 'b', name: 'Nimal', openCount: 4 },
      { id: 'a', name: 'Amara', openCount: 1 },
      { id: 'c', name: 'Saman', openCount: 1 },
    ])
    expect(picked?.id).toBe('a')
  })
})
