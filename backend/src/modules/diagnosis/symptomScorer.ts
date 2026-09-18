import {
  BUD_CONDITION_PROFILES,
  BUD_DISCLAIMER,
  type BudConditionCode,
} from '../../constants/budCrownDiseases.js'
import {
  FRUIT_CONDITION_PROFILES,
  FRUIT_DISCLAIMER,
  type FruitConditionCode,
} from '../../constants/fruitNutDiseases.js'
import {
  STEM_CONDITION_PROFILES,
  STEM_DISCLAIMER,
  type StemConditionCode,
} from '../../constants/stemTrunkDiseases.js'
import type { StemDiagnosisDetail } from '../../types/index.js'

type Symptoms = Record<string, string | boolean>

function val(symptoms: Symptoms, key: string) {
  const value = symptoms[key]
  return typeof value === 'string' ? value : value === true ? 'yes' : ''
}

function isYes(symptoms: Symptoms, key: string) {
  return val(symptoms, key) === 'yes'
}

function add(scores: Record<string, number>, code: string, amount: number, evidence: string[], label: string) {
  if (amount <= 0) return
  scores[code] = (scores[code] ?? 0) + amount
  evidence.push(label)
}

function band(score: number) {
  if (score >= 70) return 'High symptom-supported match'
  if (score >= 45) return 'Moderate match—officer verification recommended'
  return 'Uncertain result—upload clearer images or contact an agriculture officer'
}

function severity(score: number) {
  if (score >= 75) return { label: 'Severe / urgent field check', value: Math.min(100, Math.round(score)) }
  if (score >= 50) return { label: 'Moderate concern', value: Math.round(score) }
  return { label: 'Early / mild signs', value: Math.round(score) }
}

function toDetail(
  scores: Record<string, number>,
  profiles: Record<string, {
    code: string
    name: string
    category: string
    causes: string
    riskFactors: string[]
    whatHappensIfWorse: string
    whatToDoNow: string
    prevention: string[]
    management: string[]
    officerReferral: boolean
    referralPriority?: string
    suggestLeafModule?: boolean
  }>,
  disclaimer: string,
  evidence: string[],
  extras?: { rbbCrossCheckRpw?: boolean; suggestLeafModule?: boolean },
): StemDiagnosisDetail {
  const rankings = Object.entries(scores)
    .map(([code, matchScore]) => ({
      code,
      name: profiles[code]?.name ?? code,
      category: profiles[code]?.category ?? 'unknown',
      matchScore: Math.max(0, Math.min(100, Math.round(matchScore))),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)

  const top = rankings[0]
  const second = rankings[1]
  const profile = top ? profiles[top.code] : undefined
  const inconclusive = !top || top.matchScore < 40 || (second && top.matchScore - second.matchScore < 8)
  const sev = severity(top?.matchScore ?? 0)

  return {
    code: top?.code ?? 'UNC',
    typeLabel: profile?.category ?? 'assessment',
    matchScore: top?.matchScore ?? 0,
    matchBandLabel: inconclusive ? 'Needs more signals' : band(top?.matchScore ?? 0),
    differentiation: second
      ? `Strongest match is ${top?.name}. Next is ${second.name} (${second.matchScore}%).`
      : 'Not enough competing conditions to differentiate.',
    severity: sev.label,
    severityScore: sev.value,
    inconclusive: Boolean(inconclusive),
    evidence: [...new Set(evidence)].slice(0, 8),
    rankings,
    cause: profile?.causes ?? 'Insufficient signs to name a cause with confidence.',
    riskFactors: profile?.riskFactors ?? [],
    whatHappensIfWorse: profile?.whatHappensIfWorse ?? 'Monitor the palm and request officer inspection if signs worsen.',
    whatToDoNow: profile?.whatToDoNow ?? 'Photograph the palm and consult a Coconut Development or Agricultural Officer.',
    prevention: profile?.prevention ?? [],
    management: profile?.management ?? [],
    officerReferral: profile?.officerReferral ?? true,
    referralPriority: profile?.referralPriority,
    disclaimer,
    rbbCrossCheckRpw: extras?.rbbCrossCheckRpw,
    suggestLeafModule: extras?.suggestLeafModule ?? profile?.suggestLeafModule,
  }
}

export function scoreStem(symptoms: Symptoms): StemDiagnosisDetail {
  const scores: Record<StemConditionCode, number> = { STB: 8, GAN: 6, RPW: 8, RBB: 8, TER: 6, ENV: 8 }
  const evidence: string[] = []
  const liquid = val(symptoms, 'q2_liquid')
  const location = val(symptoms, 'q6_location')
  const holes = val(symptoms, 'q8_holes')

  if (liquid === 'reddish') add(scores, 'STB', 22, evidence, 'Reddish-brown trunk fluid')
  if (liquid === 'dark') add(scores, 'STB', 12, evidence, 'Dark dried bleeding')
  if (isYes(symptoms, 'q3_longitudinal')) add(scores, 'STB', 18, evidence, 'Longitudinal bark cracks')
  if (isYes(symptoms, 'q4_black_patches')) add(scores, 'STB', 14, evidence, 'Dried black patches')
  if (symptoms.q5_fibrous === true) add(scores, 'STB', 12, evidence, 'Brown fibrous decay')
  if (location === 'trunk') add(scores, 'STB', 8, evidence, 'Mid-trunk damage')

  if (isYes(symptoms, 'q7_bracket')) add(scores, 'GAN', 40, evidence, 'Bracket fungus at base')
  if (location === 'base') add(scores, 'GAN', 18, evidence, 'Basal damage')
  if (liquid === 'reddish' && location === 'base') add(scores, 'GAN', 10, evidence, 'Basal bleeding')

  if (holes === 'several' || holes === 'many') add(scores, 'RPW', 16, evidence, 'Multiple entry holes')
  if (isYes(symptoms, 'q10_frass')) add(scores, 'RPW', 14, evidence, 'Frass at holes')
  if (isYes(symptoms, 'q11_viscous')) add(scores, 'RPW', 14, evidence, 'Brown viscous fluid')
  if (isYes(symptoms, 'q12_crunch')) add(scores, 'RPW', 18, evidence, 'Internal crunching')
  if (isYes(symptoms, 'q13_cocoon')) add(scores, 'RPW', 16, evidence, 'Fibrous cocoons')

  if (isYes(symptoms, 'q14_vcuts')) add(scores, 'RBB', 22, evidence, 'V-shaped leaf cuts')
  if (isYes(symptoms, 'q15_bud_frass')) add(scores, 'RBB', 16, evidence, 'Bud/crown frass')
  if (isYes(symptoms, 'q16_malformed')) add(scores, 'RBB', 12, evidence, 'Malformed young leaves')
  if (isYes(symptoms, 'q17_flag_leaf')) add(scores, 'RBB', 12, evidence, 'Broken flag leaf')
  if (isYes(symptoms, 'q_visible_beetle')) add(scores, 'RBB', 10, evidence, 'Beetle seen')

  if (isYes(symptoms, 'q18_mud')) add(scores, 'TER', 22, evidence, 'Mud runways')
  if (isYes(symptoms, 'q19_termites')) add(scores, 'TER', 24, evidence, 'Termites visible')
  if (isYes(symptoms, 'q20_bark_eaten')) add(scores, 'TER', 16, evidence, 'Eaten bark')

  if (isYes(symptoms, 'q24_fire')) add(scores, 'ENV', 18, evidence, 'Fire damage')
  if (isYes(symptoms, 'q25_lightning')) add(scores, 'ENV', 18, evidence, 'Lightning damage')
  if (val(symptoms, 'q26_flooding') === 'yes' || val(symptoms, 'q26_flooding') === 'recent') {
    add(scores, 'ENV', 12, evidence, 'Flooding')
  }
  if (isYes(symptoms, 'q27_fertiliser')) add(scores, 'ENV', 12, evidence, 'Fertiliser burn')
  if (val(symptoms, 'q23_injury') === 'yes' || val(symptoms, 'q23_injury') === 'recent') {
    add(scores, 'ENV', 12, evidence, 'Mechanical injury')
  }

  return toDetail(scores, STEM_CONDITION_PROFILES, STEM_DISCLAIMER, evidence, {
    rbbCrossCheckRpw: (scores.RBB ?? 0) > 30 && (scores.RPW ?? 0) > 30,
  })
}

export function scoreBud(symptoms: Symptoms): StemDiagnosisDetail {
  const scores: Record<BudConditionCode, number> = { BR: 8, RPW: 8, RBB: 8, PLB: 6, PHY: 8 }
  const evidence: string[] = []

  if (isYes(symptoms, 'bc_q3_pullable')) add(scores, 'BR', 18, evidence, 'Pullable spear leaf')
  if (isYes(symptoms, 'bc_q5_soft_rot')) add(scores, 'BR', 22, evidence, 'Soft rotten bud tissue')
  if (isYes(symptoms, 'bc_q6_foul')) add(scores, 'BR', 18, evidence, 'Foul smell from crown')
  if (isYes(symptoms, 'bc_q7_bud_fall')) add(scores, 'BR', 12, evidence, 'Bud/spear collapse')
  if (isYes(symptoms, 'bc_q23_lower_green')) add(scores, 'BR', 8, evidence, 'Lower leaves still green')
  if (isYes(symptoms, 'bc_q26_humidity') || isYes(symptoms, 'bc_q27_flood')) {
    add(scores, 'BR', 8, evidence, 'Wet / flood-prone site')
  }

  if (val(symptoms, 'bc_q8_holes') === 'several' || val(symptoms, 'bc_q8_holes') === 'many') {
    add(scores, 'RPW', 16, evidence, 'Crown holes')
  }
  if (isYes(symptoms, 'bc_q10_frass')) add(scores, 'RPW', 14, evidence, 'Frass')
  if (isYes(symptoms, 'bc_q11_viscous')) add(scores, 'RPW', 14, evidence, 'Viscous fluid')
  if (isYes(symptoms, 'bc_q12_crunch')) add(scores, 'RPW', 16, evidence, 'Crunching sounds')
  if (isYes(symptoms, 'bc_q13_cocoon') || isYes(symptoms, 'bc_q21_tilt')) {
    add(scores, 'RPW', 12, evidence, 'Cocoons or tilting bud')
  }

  if (isYes(symptoms, 'bc_q14_vcuts')) add(scores, 'RBB', 22, evidence, 'V-shaped cuts')
  if (isYes(symptoms, 'bc_q15_bud_frass')) add(scores, 'RBB', 16, evidence, 'Bud entry frass')
  if (isYes(symptoms, 'bc_q16_crooked')) add(scores, 'RBB', 12, evidence, 'Crooked young leaves')
  if (isYes(symptoms, 'bc_q17_flag')) add(scores, 'RBB', 12, evidence, 'Broken flag leaf')

  if (isYes(symptoms, 'bc_q18_brown_patches')) add(scores, 'PLB', 20, evidence, 'Brown patches on bud leaves')
  if (isYes(symptoms, 'bc_q19_superficial')) add(scores, 'PLB', 16, evidence, 'Superficial feeding')
  if (val(symptoms, 'bc_q1_age') === 'seedling' || val(symptoms, 'bc_q1_age') === 'young') {
    add(scores, 'PLB', 10, evidence, 'Young palm')
  }

  if (isYes(symptoms, 'bc_q30_physical') || isYes(symptoms, 'bc_q29_wound')) {
    add(scores, 'PHY', 20, evidence, 'Physical crown injury')
  }

  return toDetail(scores, BUD_CONDITION_PROFILES, BUD_DISCLAIMER, evidence, {
    suggestLeafModule: isYes(symptoms, 'bc_leaflet_surface'),
  })
}

export function scoreFruit(symptoms: Symptoms): StemDiagnosisDetail {
  const scores: Record<FruitConditionCode, number> = { CM: 8, CS: 6, CC: 6, RAT: 8, PNF: 8, PHY: 6 }
  const evidence: string[] = []

  if (isYes(symptoms, 'fr_q3_triangle')) add(scores, 'CM', 22, evidence, 'Pale triangle below perianth')
  if (isYes(symptoms, 'fr_q4_corky')) add(scores, 'CM', 18, evidence, 'Corky brown scar')
  if (isYes(symptoms, 'fr_q5_downward')) add(scores, 'CM', 12, evidence, 'Scar expanding downward')
  if (isYes(symptoms, 'fr_q6_small') || isYes(symptoms, 'fr_q7_deformed')) {
    add(scores, 'CM', 10, evidence, 'Small or deformed nuts')
  }
  if (isYes(symptoms, 'fr_q9_y_crack')) add(scores, 'CM', 12, evidence, 'Y-shaped cracks')

  if (isYes(symptoms, 'fr_q11_scale')) add(scores, 'CS', 24, evidence, 'Scale insects on nut')
  if (isYes(symptoms, 'fr_q12_encrust')) add(scores, 'CS', 16, evidence, 'Yellow-white encrustation')
  if (isYes(symptoms, 'fr_q13_leaf_scale')) add(scores, 'CS', 12, evidence, 'Scale also on leaves')

  if (isYes(symptoms, 'fr_q14_gnaw')) add(scores, 'RAT', 24, evidence, 'Gnaw marks')
  if (isYes(symptoms, 'fr_q15_hole')) add(scores, 'RAT', 18, evidence, 'Hole through husk')
  if (isYes(symptoms, 'fr_q16_kernel') || isYes(symptoms, 'fr_q17_rodents')) {
    add(scores, 'RAT', 12, evidence, 'Kernel eaten / rodents nearby')
  }

  if (isYes(symptoms, 'fr_q18_scrape')) add(scores, 'CC', 20, evidence, 'Shallow epidermis scrape')
  if (isYes(symptoms, 'fr_q19_brown_leaves') || isYes(symptoms, 'fr_q20_galleries')) {
    add(scores, 'CC', 16, evidence, 'Leaf galleries / brown lower leaves')
  }

  if (val(symptoms, 'fr_q21_fall') === 'many' || val(symptoms, 'fr_q21_fall') === 'several') {
    add(scores, 'PNF', 18, evidence, 'Many immature nuts falling')
  }
  if (isYes(symptoms, 'fr_q25_drought')) add(scores, 'PNF', 14, evidence, 'Drought stress')
  if (!isYes(symptoms, 'fr_q22_fallen_mite') && !isYes(symptoms, 'fr_q23_fallen_gnaw')) {
    add(scores, 'PNF', 6, evidence, 'Fall without mite/gnaw scars')
  }
  if (isYes(symptoms, 'fr_q26_mechanical')) add(scores, 'PHY', 22, evidence, 'Mechanical injury')

  return toDetail(scores, FRUIT_CONDITION_PROFILES, FRUIT_DISCLAIMER, evidence, {
    suggestLeafModule: (scores.CC ?? 0) >= 30,
  })
}
