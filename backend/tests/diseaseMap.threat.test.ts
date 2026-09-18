import { haversineKm, threatLevel } from '../src/modules/diseaseMap/threat.js'

describe('disease map threat helpers', () => {
  it('classifies confidence into threat levels', () => {
    expect(threatLevel(0.91)).toBe('critical')
    expect(threatLevel(0.74)).toBe('high')
    expect(threatLevel(0.62)).toBe('medium')
    expect(threatLevel(0.4)).toBe('low')
  })

  it('measures Puttalam to Gampaha as outside a 25 km watch zone', () => {
    const km = haversineKm(
      { lat: 8.032, lng: 79.83 },
      { lat: 7.084, lng: 80.0098 },
    )
    expect(km).toBeGreaterThan(90)
    expect(km).toBeLessThan(130)
  })
})
