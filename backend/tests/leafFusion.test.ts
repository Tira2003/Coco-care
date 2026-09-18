import { fuseLeafPredictions } from '../src/modules/diagnosis/leafFusion.js'

describe('leaf fusion', () => {
  it('maps Azure tags and ranks the top disease', () => {
    const result = fuseLeafPredictions(
      [
        { tagName: 'CCI Caterpillar', probability: 0.82 },
        { tagName: 'Healthy Leaves', probability: 0.11 },
        { tagName: 'Gray Leaf Spot', probability: 0.04 },
      ],
      {},
    )
    expect(result.finalResult).toBe('Coconut Caterpillar Infestation (CCI)')
    expect(result.imageResult).toBe('Coconut Caterpillar Infestation (CCI)')
    expect(result.symptomResult).toBe('ML classification only')
    expect(result.confidence).toBeGreaterThan(0.8)
    expect(result.detectedEvidence).toBe('Caterpillar Present')
  })

  it('boosts a questionnaire-supported disease when ML is mixed', () => {
    const result = fuseLeafPredictions(
      [
        { tagName: 'Gray Leaf Spot', probability: 0.41 },
        { tagName: 'CCI leaflets', probability: 0.39 },
      ],
      {
        cci_silk_galleries: true,
        cci_frass: true,
        cci_visible_insects: true,
        q_silk_frass: 'yes',
      },
    )
    expect(result.finalResult).toBe('Coconut Caterpillar Infestation (CCI)')
    expect(result.symptomResult).toBe('Coconut Caterpillar Infestation (CCI)')
    expect(result.detectedEvidence).toBe('Leaf Feeding Damage')
  })
})
