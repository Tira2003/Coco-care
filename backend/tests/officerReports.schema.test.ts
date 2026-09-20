import { reviewReportSchema } from '../src/modules/reports/reports.schemas.js'

describe('officer report review', () => {
  it('accepts verify and reject with an optional comment', () => {
    expect(reviewReportSchema.parse({ action: 'verify' }).action).toBe('verify')
    expect(reviewReportSchema.parse({ action: 'reject', comment: ' Not this disease ' }).comment).toBe(
      'Not this disease',
    )
  })

  it('rejects unknown review actions', () => {
    expect(() => reviewReportSchema.parse({ action: 'hold' })).toThrow()
  })
})
