export const CONSULTATION_TOPICS = [
  'Scan follow-up',
  'Leaf or frond problem',
  'Stem, bud, or crown',
  'Fertilizer or nutrition',
  'Nearby outbreak',
  'Other',
] as const

export type ConsultationTopic = (typeof CONSULTATION_TOPICS)[number]
