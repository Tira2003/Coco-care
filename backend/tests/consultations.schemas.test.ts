import {
  consultationMessageSchema,
  createConsultationSchema,
} from '../src/modules/consultations/consultations.schemas.js'

const photo = {
  kind: 'image' as const,
  url: 'data:image/jpeg;base64,/9j/4AAQ',
  name: 'leaf',
  mime: 'image/jpeg',
}

describe('consultation schemas', () => {
  it('allows a photo-only request', () => {
    const parsed = createConsultationSchema.parse({
      topic: 'Scan follow-up',
      attachments: [photo],
    })
    expect(parsed.message).toBe('')
    expect(parsed.attachments).toHaveLength(1)
  })

  it('rejects an empty request', () => {
    expect(() =>
      createConsultationSchema.parse({
        topic: 'Scan follow-up',
        message: '   ',
        attachments: [],
      }),
    ).toThrow()
  })

  it('allows a media-only reply', () => {
    const parsed = consultationMessageSchema.parse({
      attachments: [photo],
    })
    expect(parsed.content).toBe('')
    expect(parsed.attachments[0]?.kind).toBe('image')
  })

  it('allows a voice-only reply', () => {
    const parsed = consultationMessageSchema.parse({
      attachments: [
        {
          kind: 'voice',
          url: 'data:audio/webm;base64,AAAA',
          name: 'Voice note',
          mime: 'audio/webm',
        },
      ],
    })
    expect(parsed.attachments[0]?.kind).toBe('voice')
  })
})
