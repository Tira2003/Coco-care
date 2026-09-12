/**
 * Coconut Bud & Crown diagnosis profiles (CRI-aligned for Sri Lanka).
 * Weights are expert-rule scores for COCO CARE, not CRI-published probabilities.
 */

export const BUD_CONDITION_CODES = ['BR', 'RPW', 'RBB', 'PLB', 'PHY'] as const
export type BudConditionCode = (typeof BUD_CONDITION_CODES)[number]

export type BudConditionCategory = 'disease' | 'pest' | 'environmental'

export interface BudConditionProfile {
  code: BudConditionCode
  name: string
  shortLabel: string
  category: BudConditionCategory
  scientificNote?: string
  causes: string
  riskFactors: string[]
  whatHappensIfWorse: string
  whatToDoNow: string
  prevention: string[]
  management: string[]
  officerReferral: boolean
  referralPriority?: 'standard' | 'high' | 'urgent'
  conservative?: boolean
}

export const BUD_CONDITION_PROFILES: Record<BudConditionCode, BudConditionProfile> = {
  BR: {
    code: 'BR',
    name: 'Bud Rot Disease',
    shortLabel: 'Bud Rot',
    category: 'disease',
    scientificNote: 'Associated with Phytophthora palmivora (CRI Bud Rot advisory).',
    causes:
      'Bud Rot is associated with Phytophthora palmivora, which attacks the coconut palm’s growing point. High humidity and wet conditions favour development and spread.',
    riskFactors: [
      'Prolonged wet / high-humidity weather',
      'Flood-prone sites such as riverbanks',
      'Heavily shaded young palms',
      'Dense canopy conditions around seedlings',
    ],
    whatHappensIfWorse:
      'Wilting can spread from the spear to adjoining crown leaves. The spear may become loose and pull out, and the bud can eventually break away. CRI warns that palms with advanced growing-point destruction may be beyond recovery.',
    whatToDoNow:
      'Arrange high-priority agricultural inspection. Early cases need prompt professional management. Do not apply fungicide dosages from outdated circulars—confirm currently approved treatments with CRI/CDO/agricultural officers.',
    prevention: [
      'Monitor spear leaves closely during prolonged wet weather',
      'Inspect susceptible palms early, especially young shaded palms',
      'Improve water management in repeatedly flooded fields',
      'Inspect surrounding palms if a confirmed case occurs nearby',
    ],
    management: [
      'Seek officer guidance before cutting crown tissue or applying chemicals',
      'In advanced cases officers may recommend destruction of seriously infected young crowns—follow local authority advice only',
      'Maintain plantation hygiene after handling infected material',
    ],
    officerReferral: true,
    referralPriority: 'high',
  },
  RPW: {
    code: 'RPW',
    name: 'Red Palm Weevil Infestation',
    shortLabel: 'Red Palm Weevil',
    category: 'pest',
    scientificNote: 'Rhynchophorus ferrugineus — larvae feed internally in crown and trunk tissues.',
    causes:
      'Larvae bore and feed inside the crown/trunk. Adults are strongly associated with fresh wounds from animals, tools, Black Beetle damage, or natural cracks.',
    riskFactors: [
      'Palms about 3–15 years of age (high surveillance priority)',
      'Fresh wounds and pruned/cut surfaces',
      'Prior Black Beetle injury',
      'Delayed detection of holes, frass, fluid, and crown weakness',
    ],
    whatHappensIfWorse:
      'Internal feeding can destroy the crown or trunk. Visible signs often understate the amount of internal damage. Bud slanting, withering, or collapse may follow.',
    whatToDoNow:
      'Urgent agricultural inspection recommended. Do not climb or stand under a structurally weakened palm. Follow CRI-recommended early detection approaches under professional advice.',
    prevention: [
      'Avoid unnecessary wounds to crown and trunk',
      'Inspect young palms regularly for holes, fibres, fluid, and bud tilt',
      'Re-check palms after Black Beetle attack',
      'Use CRI-recommended monitoring / early-detection tools where available',
    ],
    management: [
      'Treat as high-priority pest until field confirmation',
      'Use only currently registered products under officer supervision',
      'Assess co-occurring Black Beetle entry points that may have invited weevils',
    ],
    officerReferral: true,
    referralPriority: 'urgent',
  },
  RBB: {
    code: 'RBB',
    name: 'Black / Rhinoceros Beetle Damage',
    shortLabel: 'Black Beetle',
    category: 'pest',
    scientificNote: 'Oryctes rhinoceros — adults bore soft tissue around the base of the bud.',
    causes:
      'Adult beetles bore into soft tissues at the base of the bud and feed on developing leaves and petioles. Damage made while leaves are folded appears as geometric or V-shaped cuts when they unfold.',
    riskFactors: [
      'Decaying coconut logs and stumps',
      'Manure heaps, fibre piles, and other organic breeding material',
      'Young plantations and seedlings',
      'Poor plantation hygiene',
    ],
    whatHappensIfWorse:
      'Growing-point injury can kill seedlings. Mature palms may show broken flag leaf, crooked young leaves, and retarded growth. Wounds may later attract Red Palm Weevil.',
    whatToDoNow:
      'Inspect also for Red Weevil signs (holes deeper into the crown, viscous fluid, crunching, cocoons). Manage breeding materials and seek advice if the growing point is threatened.',
    prevention: [
      'Inspect young palms frequently for bud holes and fresh frass',
      'Remove or manage decaying coconut logs/stumps appropriately',
      'Manage large organic waste piles',
      'Act early on fresh bud entry holes',
    ],
    management: [
      'Prioritise sanitation of breeding sites under local guidance',
      'Cross-check for Red Palm Weevil after severe beetle wounds',
      'Seek officer advice before insecticide use',
    ],
    officerReferral: true,
    referralPriority: 'standard',
  },
  PLB: {
    code: 'PLB',
    name: 'Possible Plesispa Beetle Infestation',
    shortLabel: 'Plesispa Beetle',
    category: 'pest',
    scientificNote:
      'CRI lists Plesispa as a coconut pest; larvae damage young bud leaves and produce brown patches, especially on seedlings and young palms.',
    causes:
      'Plesispa larvae feed on young/unopened crown leaves, typically creating brown patches through relatively superficial feeding rather than deep crown boring.',
    riskFactors: [
      'Seedlings and young palms',
      'Damage concentrated on young bud leaves',
      'Nursery or young-plantation conditions',
    ],
    whatHappensIfWorse:
      'Continued feeding can damage young crown foliage and set back growth of seedlings. Severe patterns that look like deep boring should be reassessed for Black Beetle or Red Weevil.',
    whatToDoNow:
      'Inspect the young crown closely and obtain agricultural advice if damage continues or spreads. CRI detail for Plesispa is more limited than for Bud Rot/weevil/beetle—treat with moderate caution.',
    prevention: [
      'Monitor young palms and nursery stock regularly',
      'Detect brown patches on unopened leaves early',
      'Seek advice before treating young plantings',
    ],
    management: [
      'Prefer close monitoring and professional confirmation',
      'If leaf-surface symptoms dominate lower fronds instead, use the Leaf diagnosis module for caterpillar/leaf diseases',
    ],
    officerReferral: true,
    referralPriority: 'standard',
    conservative: true,
  },
  PHY: {
    code: 'PHY',
    name: 'Physical / Environmental Crown Damage',
    shortLabel: 'Physical damage',
    category: 'environmental',
    causes:
      'Broken spear or fronds from wind, falling objects, pruning, tools, animals, or other mechanical force—without infectious rot or characteristic pest boring patterns.',
    riskFactors: [
      'Recent storms or wind damage',
      'Pruning or tool injury to the crown',
      'Falling branches/objects',
      'Animal damage to the spear or crown',
    ],
    whatHappensIfWorse:
      'Open wounds and broken tissue can later invite Red Palm Weevil or secondary decay if neglected, even if the original problem was physical.',
    whatToDoNow:
      'Protect the palm from further injury, monitor the spear and crown for rot or pest signs, and seek advice if the growing point appears compromised.',
    prevention: [
      'Avoid unnecessary pruning wounds in the crown',
      'Protect young palms from animals and mechanical damage',
      'Monitor broken spears after storms',
    ],
    management: [
      'Do not assume fungal bud rot solely because a spear looks broken',
      'Escalate to officer inspection if foul smell, soft rot, or boring signs develop',
    ],
    officerReferral: false,
    referralPriority: 'standard',
  },
}

export const BUD_DISCLAIMER =
  'This is a preliminary symptom-match tool based on expert rules aligned with CRI advisories. It is not a laboratory confirmation and does not replace field diagnosis by a qualified agricultural professional. For leaflet-only damage patterns (e.g. coconut caterpillar), use the Leaf diagnosis module.'
