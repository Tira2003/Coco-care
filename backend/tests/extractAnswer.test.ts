import {
  chunksCoverQuestion,
  criGapMessage,
  extractAnswer,
  selectChunksForQuestion,
  tokenizeQuestion,
  withSource,
} from '../src/modules/chat/extractAnswer.js'
import type { RetrievedChunk } from '../src/modules/knowledge/knowledge.repository.js'

const budRot: RetrievedChunk = {
  title: 'Bud Rot Disease and its Control',
  source: 'CRI Advisory Circular',
  sourceUrl: 'https://cri.gov.lk/wp-content/uploads/2021/10/b9.pdf',
  content: `Bud Rot Disease and its Control — Control
- Infected young palms (advanced stage): The crown should be cut and burnt to destroy the fungus.
- If detected early: The bud region should be thoroughly wetted with Bordeaux mixture or 1% copper fungicide solution.
Bud rot is a fatal disease of coconut caused by the fungus Phytophthora palmivora, which attacks the growing point of the palm.`,
  score: 0.82,
}

const leafWilt: RetrievedChunk = {
  title: 'Weligama Coconut Leaf Wilt Disease',
  source: 'CRI Advisory Circular',
  sourceUrl: null,
  content: `Weligama Coconut Leaf Wilt Disease — Control
Identify infected trees, remove them from the field, and burn the crown to prevent spreading to other areas.
Leaflets become flat and bend like ribs; lower fronds turn yellow.`,
  score: 0.8,
}

describe('chat extractAnswer', () => {
  it('keeps farming keywords from a coconut question', () => {
    expect(tokenizeQuestion('How to treat bud rot disease?')).toEqual(
      expect.arrayContaining(['treat', 'bud', 'rot', 'disease']),
    )
  })

  it('pulls CRI control steps for bud rot', () => {
    const result = extractAnswer('How to treat bud rot disease?', [budRot])
    expect(result.sourceTitle).toBe('Bud Rot Disease and its Control')
    expect(result.body).toMatch(/Bordeaux mixture/i)
    expect(result.body).not.toMatch(/ — Control/)
  })

  it('does not treat leaf rot as the same as bud rot', () => {
    const result = extractAnswer('how to treat leaf rot disease', [budRot, leafWilt])
    expect(result.body).toMatch(/do not list a coconut disease called "leaf rot"/i)
    expect(result.body).toMatch(/Bud Rot/)
    expect(result.body).toMatch(/Leaf Wilt/)
  })

  it('keeps an aliased bud-rot question on the bud-rot circular', () => {
    const selected = selectChunksForQuestion('How to treat bud rot disease?', [budRot, leafWilt])
    expect(selected.every((chunk) => chunk.title.includes('Bud Rot'))).toBe(true)
  })

  it('appends a Source line for the UI citation chip', () => {
    expect(withSource('Keep drainage clear.', 'Bud Rot Disease and its Control')).toMatch(
      /\n\nSource: Bud Rot Disease and its Control$/,
    )
  })

  it('strips markdown asterisks from Groq-style answers', () => {
    const cleaned = withSource(
      '**Bud-rot** – Practical control\n- Wet the bud with Bordeaux **or** 1% copper.\n*Handle fungicides with care.*',
      'Bud Rot Disease and its Control',
    )
    expect(cleaned).not.toMatch(/\*/)
    expect(cleaned).toMatch(/Bud-rot/)
    expect(cleaned).toMatch(/Bordeaux or 1% copper/)
  })

  it('does not invent a watering schedule from fertilizer circulars', () => {
    expect(criGapMessage('how the watering the new coconut trees')).toMatch(/do not give a watering schedule/i)
    const basal: RetrievedChunk = {
      title: 'Basal Fertilizer Mixture',
      source: 'CRI Advisory Circular',
      sourceUrl: null,
      content: 'Fertilizer application should be done after heavy monsoon rains when there is good moisture in the soil.',
      score: 0.7,
    }
    expect(chunksCoverQuestion('how the watering the new coconut trees', [basal])).toBe(false)
  })
})
