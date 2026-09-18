import { heatmapQuerySchema } from '../src/modules/diseaseMap/diseaseMap.schemas.js'

describe('heatmap query filters', () => {
  it('treats empty query strings as unset', () => {
    expect(
      heatmapQuerySchema.parse({
        diseaseType: '',
        district: '  ',
        minWeight: '',
        from: '',
        to: '',
      }),
    ).toEqual({
      diseaseType: undefined,
      district: undefined,
      minWeight: undefined,
      from: undefined,
      to: undefined,
    })
  })

  it('keeps calendar dates from ISO timestamps', () => {
    expect(
      heatmapQuerySchema.parse({
        from: '2026-09-18T00:00:00.000Z',
        to: '2026-09-18T23:59:59.999Z',
        minWeight: '0.7',
        diseaseType: 'Leaf Rot',
      }),
    ).toEqual({
      diseaseType: 'Leaf Rot',
      district: undefined,
      minWeight: 0.7,
      from: '2026-09-18',
      to: '2026-09-18',
    })
  })
})
