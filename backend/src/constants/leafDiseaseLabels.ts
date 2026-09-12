export const LEAF_DISPLAY_DISEASES = [
  'Coconut Caterpillar Infestation (CCI)',
  'Weligama Coconut Leaf Wilt – Early Stage (Yellowing)',
  'Weligama Coconut Leaf Wilt – Intermediate Stage (Flaccidity)',
  'Weligama Coconut Leaf Wilt – Advanced Stage (Drying of Leaflets)',
  'Leaf Rot',
  'Gray Leaf Spot',
  'Healthy Coconut Leaf',
] as const

export type LeafDisplayDisease = (typeof LEAF_DISPLAY_DISEASES)[number]

const TAG_ALIASES: Record<string, LeafDisplayDisease> = {
  cci: 'Coconut Caterpillar Infestation (CCI)',
  'cci leaflets': 'Coconut Caterpillar Infestation (CCI)',
  'cci caterpiller': 'Coconut Caterpillar Infestation (CCI)',
  'cci caterpillar': 'Coconut Caterpillar Infestation (CCI)',
  'cci leaflet output 2': 'Coconut Caterpillar Infestation (CCI)',
  'coconut caterpillar infestation': 'Coconut Caterpillar Infestation (CCI)',
  'coconut caterpillar infestation (cci)': 'Coconut Caterpillar Infestation (CCI)',

  'wclwd yellowing': 'Weligama Coconut Leaf Wilt – Early Stage (Yellowing)',
  'wclwd flaccidity': 'Weligama Coconut Leaf Wilt – Intermediate Stage (Flaccidity)',
  'wclwd dryingofleaflets': 'Weligama Coconut Leaf Wilt – Advanced Stage (Drying of Leaflets)',
  'wclwd drying of leaflets': 'Weligama Coconut Leaf Wilt – Advanced Stage (Drying of Leaflets)',

  'leaf rot': 'Leaf Rot',
  'gray leaf spot': 'Gray Leaf Spot',
  'grey leaf spot': 'Gray Leaf Spot',
  'gray leaf rot': 'Gray Leaf Spot',
  'grey leaf rot': 'Gray Leaf Spot',

  'healthy leaves': 'Healthy Coconut Leaf',
  'healthy': 'Healthy Coconut Leaf',
  'healthy coconut leaf': 'Healthy Coconut Leaf',
}

export interface LeafPrediction {
  label: LeafDisplayDisease
  probability: number
}

export function normalizeTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
}

export function mapTagToDisplayLabel(tagName: string): LeafDisplayDisease | null {
  const normalized = normalizeTag(tagName)
  if (TAG_ALIASES[normalized]) return TAG_ALIASES[normalized]

  const exact = LEAF_DISPLAY_DISEASES.find((d) => normalizeTag(d) === normalized)
  return exact ?? null
}

export function getCciDetectedEvidence(
  raw: Array<{ tagName: string; probability: number }>,
): 'Caterpillar Present' | 'Leaf Feeding Damage' | null {
  let caterpillar = 0
  let leaflets = 0

  for (const item of raw) {
    const normalized = normalizeTag(item.tagName)
    if (normalized === 'cci caterpiller' || normalized === 'cci caterpillar') {
      caterpillar = Math.max(caterpillar, item.probability)
    }
    if (normalized === 'cci leaflets') {
      leaflets = Math.max(leaflets, item.probability)
    }
  }

  if (caterpillar === 0 && leaflets === 0) return null
  return caterpillar >= leaflets ? 'Caterpillar Present' : 'Leaf Feeding Damage'
}

export function buildLeafPredictions(
  raw: Array<{ tagName: string; probability: number }>,
): LeafPrediction[] {
  const scores = new Map<LeafDisplayDisease, number>()

  for (const item of raw) {
    const label = mapTagToDisplayLabel(item.tagName)
    if (!label) continue
    scores.set(label, Math.max(scores.get(label) ?? 0, item.probability))
  }

  return LEAF_DISPLAY_DISEASES.map((label) => ({
    label,
    probability: scores.get(label) ?? 0,
  }))
}

export const LEAF_DISEASE_ADVICE: Record<LeafDisplayDisease, string> = {
  'Coconut Caterpillar Infestation (CCI)':
    'Inspect the entire tree for caterpillars and feeding damage. Remove heavily infested leaves and monitor nearby palms.',
  'Weligama Coconut Leaf Wilt – Early Stage (Yellowing)':
    'Continue monitoring every few weeks. Inspect neighbouring palms and report suspected cases to agricultural officers.',
  'Weligama Coconut Leaf Wilt – Intermediate Stage (Flaccidity)':
    'The disease is progressing. Monitor carefully and consult CRI or local agricultural extension officers.',
  'Weligama Coconut Leaf Wilt – Advanced Stage (Drying of Leaflets)':
    'Severe damage detected. Consult CRI Sri Lanka or local agricultural officers for management options.',
  'Leaf Rot':
    'Remove infected leaves, improve drainage and sanitation, and apply fungicide per CRI or officer recommendation.',
  'Gray Leaf Spot':
    'Prune affected leaves, improve air circulation, and avoid prolonged leaf wetness.',
  'Healthy Coconut Leaf':
    'No significant disease signs detected. Continue regular monitoring and good plantation practices.',
}
