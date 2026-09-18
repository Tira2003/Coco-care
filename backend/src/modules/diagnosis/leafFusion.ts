import {
  LEAF_DISEASE_ADVICE,
  LEAF_DISPLAY_DISEASES,
  buildLeafPredictions,
  getCciDetectedEvidence,
  type LeafDisplayDisease,
  type LeafPrediction,
} from '../../constants/leafDiseaseLabels.js'

const SYMPTOM_PREFIXES: Array<{ prefix: string; label: LeafDisplayDisease }> = [
  { prefix: 'gls_', label: 'Gray Leaf Spot' },
  { prefix: 'wclwd_e_', label: 'Weligama Coconut Leaf Wilt – Early Stage (Yellowing)' },
  { prefix: 'wclwd_i_', label: 'Weligama Coconut Leaf Wilt – Intermediate Stage (Flaccidity)' },
  { prefix: 'wclwd_a_', label: 'Weligama Coconut Leaf Wilt – Advanced Stage (Drying of Leaflets)' },
  { prefix: 'lr_', label: 'Leaf Rot' },
  { prefix: 'cci_', label: 'Coconut Caterpillar Infestation (CCI)' },
  { prefix: 'healthy_', label: 'Healthy Coconut Leaf' },
]

export type AzurePrediction = { tagName: string; probability: number }

export function matchLevelFor(confidence: number): 'high' | 'moderate' | 'uncertain' {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.55) return 'moderate'
  return 'uncertain'
}

export function symptomVotes(symptoms: Record<string, string | boolean>) {
  const votes = new Map<LeafDisplayDisease, number>()
  for (const label of LEAF_DISPLAY_DISEASES) votes.set(label, 0)

  for (const [key, value] of Object.entries(symptoms)) {
    if (value !== true && value !== 'yes') continue
    const match = SYMPTOM_PREFIXES.find((item) => key.startsWith(item.prefix))
    if (match) votes.set(match.label, (votes.get(match.label) ?? 0) + 1)
  }

  const area = String(symptoms.leaf_area ?? '')
  if (area === 'youngest') bump(votes, 'Leaf Rot', 1)
  if (area === 'older') {
    bump(votes, 'Gray Leaf Spot', 0.5)
    bump(votes, 'Coconut Caterpillar Infestation (CCI)', 0.5)
  }
  if (area === 'middle') bump(votes, 'Weligama Coconut Leaf Wilt – Early Stage (Yellowing)', 0.5)
  if (area === 'most') bump(votes, 'Weligama Coconut Leaf Wilt – Intermediate Stage (Flaccidity)', 0.5)
  if (area === 'normal') bump(votes, 'Healthy Coconut Leaf', 1)

  if (symptoms.q_spots_bordered === 'yes') bump(votes, 'Gray Leaf Spot', 1)
  if (symptoms.q_uneven_yellowing === 'yes') {
    bump(votes, 'Weligama Coconut Leaf Wilt – Early Stage (Yellowing)', 1)
  }
  if (symptoms.q_leaflets_bent === 'slightly') {
    bump(votes, 'Weligama Coconut Leaf Wilt – Intermediate Stage (Flaccidity)', 1)
  }
  if (symptoms.q_leaflets_bent === 'severely') {
    bump(votes, 'Weligama Coconut Leaf Wilt – Advanced Stage (Drying of Leaflets)', 1)
  }
  if (symptoms.q_silk_frass === 'yes') bump(votes, 'Coconut Caterpillar Infestation (CCI)', 1.5)
  if (symptoms.q_spear_rotten === 'yes') bump(votes, 'Leaf Rot', 1.5)

  return votes
}

function bump(votes: Map<LeafDisplayDisease, number>, label: LeafDisplayDisease, amount: number) {
  votes.set(label, (votes.get(label) ?? 0) + amount)
}

export function fuseLeafPredictions(
  raw: AzurePrediction[],
  symptoms: Record<string, string | boolean>,
): {
  predictions: LeafPrediction[]
  imageResult: string
  symptomResult: string
  finalResult: string
  confidence: number
  detectedEvidence: string | undefined
  matchLevel: 'high' | 'moderate' | 'uncertain'
  secondaryConditions: string[]
  advice: string
} {
  const ml = buildLeafPredictions(raw)
  const topMl = [...ml].sort((a, b) => b.probability - a.probability)[0]
  const votes = symptomVotes(symptoms)
  const voteTotal = [...votes.values()].reduce((sum, value) => sum + value, 0)
  const hasSymptoms = voteTotal > 0

  const fused = ml.map((item) => {
    const vote = votes.get(item.label as LeafDisplayDisease) ?? 0
    const symptomScore = hasSymptoms ? Math.min(1, vote / 3) : 0
    const probability = hasSymptoms
      ? Math.min(1, item.probability * 0.6 + symptomScore * 0.4)
      : item.probability
    return { label: item.label, probability }
  })

  fused.sort((a, b) => b.probability - a.probability)
  const top = fused[0] ?? { label: 'Healthy Coconut Leaf', probability: 0 }
  const symptomTop =
    hasSymptoms
      ? [...votes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'ML classification only'
      : 'ML classification only'

  const confidence = Math.round(top.probability * 1000) / 1000
  const matchLevel = matchLevelFor(confidence)
  const secondaryConditions = fused
    .slice(1)
    .filter((item) => item.probability >= 0.25)
    .slice(0, 2)
    .map((item) => item.label)

  return {
    predictions: fused,
    imageResult: topMl?.label ?? top.label,
    symptomResult: hasSymptoms ? String(symptomTop) : 'ML classification only',
    finalResult: top.label,
    confidence,
    detectedEvidence: getCciDetectedEvidence(raw) ?? undefined,
    matchLevel,
    secondaryConditions,
    advice: LEAF_DISEASE_ADVICE[top.label as LeafDisplayDisease] ?? 'Continue monitoring the palm.',
  }
}
