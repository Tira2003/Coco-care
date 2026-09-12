/**
 * Coconut Fruit / Nut diagnosis profiles (CRI-aligned for Sri Lanka).
 * Weights are expert-rule scores for COCO CARE, not CRI-published probabilities.
 */

export const FRUIT_CONDITION_CODES = ['CM', 'CS', 'CC', 'RAT', 'PNF', 'PHY'] as const
export type FruitConditionCode = (typeof FRUIT_CONDITION_CODES)[number]

export type FruitConditionCategory = 'pest' | 'physiological' | 'environmental'

export interface FruitConditionProfile {
  code: FruitConditionCode
  name: string
  shortLabel: string
  category: FruitConditionCategory
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
  suggestLeafModule?: boolean
}

export const FRUIT_CONDITION_PROFILES: Record<FruitConditionCode, FruitConditionProfile> = {
  CM: {
    code: 'CM',
    name: 'Coconut Mite Infestation',
    shortLabel: 'Coconut Mite',
    category: 'pest',
    scientificNote: 'Aceria guerreronis — colonies live beneath the perianth of developing nuts.',
    causes:
      'Coconut mite is a microscopic pest that lives in colonies beneath the floral cap (perianth) of developing nuts. Feeding damages young fruit tissue. CRI notes it was first recorded in Sri Lanka (Kalpitiya Peninsula, late 1990s) and is established in coconut-growing areas. Young nuts around 3–6 months are especially vulnerable.',
    riskFactors: [
      'Young nuts approximately 3–6 months old',
      'Prolonged dry periods (higher mite activity reported)',
      'Infested fallen immature nuts left in the field',
      'Movement of infested fresh nuts/husks into unaffected areas',
    ],
    whatHappensIfWorse:
      'Pale triangular scars become corky/brown, expand down the nut surface, and may deform or stunt the fruit. Deep Y-shaped cracks and sticky exudate can develop; severe infestation leads to premature nut fall and lost yield quality.',
    whatToDoNow:
      'High-priority inspection of young bunches recommended. Confirm with an agricultural officer before applying any product. CRI lists biological options such as predatory mites among current pest-management services—use currently approved guidance only.',
    prevention: [
      'Inspect young developing nuts frequently, especially near the perianth',
      'Look for early pale triangular patches below the floral cap',
      'Collect and destroy severely infested fallen immature nuts to reduce spread',
      'Avoid transporting infested fresh nuts/husks into unaffected plantations',
      'Follow current CRI/CDO recommendations for local management programmes',
    ],
    management: [
      'Map how many bunches show classic perianth lesions',
      'Do not use outdated pesticide/engine-oil recipes from old circulars without current expert verification',
      'Request officer advice for widespread or economically serious outbreaks',
    ],
    officerReferral: true,
    referralPriority: 'high',
  },
  CS: {
    code: 'CS',
    name: 'Coconut Scale Infestation on Nuts',
    shortLabel: 'Coconut Scale',
    category: 'pest',
    scientificNote: 'Aspidiotus destructor — mainly a leaflet pest; severe outbreaks can reach spikes and nuts.',
    causes:
      'Coconut Scale is primarily a foliage pest. CRI notes that during severe infestations, flower spikes and nuts can also become covered with scale insects under yellowish-white encrustations.',
    riskFactors: [
      'Severe scale outbreak already present on leaves',
      'Dry-weather conditions favouring scale build-up',
      'Delayed detection of leaf-scale populations',
    ],
    whatHappensIfWorse:
      'Heavy scale crust on nuts and flower spikes can stress fruit development and add to overall palm infestation pressure when leaves are already badly affected.',
    whatToDoNow:
      'Treat this as evidence of a wider palm-scale outbreak. Inspect lower leaf undersides, map severity, and seek current CRI pest-management guidance. Consider the Leaf diagnosis module if foliage damage dominates.',
    prevention: [
      'Monitor leaf-scale populations early, especially in dry weather',
      'Act before scale becomes severe enough to colonise spikes and nuts',
      'Maintain overall palm health and avoid uncontrolled canopy neglect',
    ],
    management: [
      'Focus control on the whole palm (leaves first), not fruit alone',
      'Use only currently registered options under officer advice',
    ],
    officerReferral: true,
    referralPriority: 'standard',
  },
  CC: {
    code: 'CC',
    name: 'Coconut Caterpillar-related Nut Surface Damage',
    shortLabel: 'Caterpillar (nut surface)',
    category: 'pest',
    scientificNote: 'Opisina arenosella — mainly leaf feeder; nut epidermis may be scraped in outbreaks.',
    causes:
      'Coconut Caterpillar primarily damages leaflets. CRI notes that during outbreaks the epidermis of nuts may also be attacked, producing superficial scraping rather than deep perianth-origin mite scars.',
    riskFactors: [
      'Active caterpillar outbreak on lower/older fronds',
      'Galleries and webbing on lower leaflet surfaces',
      'Widespread brown, dried lower leaves',
    ],
    whatHappensIfWorse:
      'Leaf damage usually remains the main economic problem. Superficial nut scraping is secondary; unchecked caterpillar outbreaks can still cause serious canopy decline.',
    whatToDoNow:
      'Likely Coconut Caterpillar-associated superficial nut damage. The main infestation is on the leaves—open the Leaf diagnosis module and arrange agricultural advice if the outbreak is active.',
    prevention: [
      'Monitor lower leaf surfaces for galleries and pest debris',
      'Treat serious leaf outbreaks early under professional guidance',
    ],
    management: [
      'Do not diagnose Coconut Mite from shallow skin scrapes alone',
      'Prioritise leaf-canopy assessment and use Leaf diagnosis for primary scoring',
    ],
    officerReferral: true,
    referralPriority: 'standard',
    conservative: true,
    suggestLeafModule: true,
  },
  RAT: {
    code: 'RAT',
    name: 'Rat / Mammalian Nut Damage',
    shortLabel: 'Rat damage',
    category: 'pest',
    scientificNote: 'Rats (and other mammals such as bandicoots) gnaw nuts for kernel and nut water.',
    causes:
      'CRI identifies rats and other mammals among coconut pests. Rats gnaw into nuts to feed on the kernel and nut water. Nuts around 3–8 months old are particularly vulnerable.',
    riskFactors: [
      'Weedy areas, debris, palm logs, stumps, husk heaps',
      'Nuts approximately 3–8 months old',
      'Easy crown access via fronds, buildings, or poles',
      'Visible nests or frequent rodent activity',
    ],
    whatHappensIfWorse:
      'Repeated gnawing holes and loss of kernel/water reduce usable nuts and can concentrate damage in the crown if rodents remain established.',
    whatToDoNow:
      'Confirm rodent pressure around palms. Improve plantation sanitation and use professionally recommended trapping/control methods. CRI describes smooth trunk barriers where neighbouring fronds/buildings do not provide alternate access.',
    prevention: [
      'Maintain plantation sanitation; reduce heavy weed and debris shelter',
      'Manage nesting sites in logs, husk heaps, and plant debris',
      'Limit easy climbing access to the crown where practical',
      'Use officer-recommended trapping or control programmes',
    ],
    management: [
      'Map which bunches and ages are attacked',
      'Combine habitat reduction with approved control methods',
    ],
    officerReferral: true,
    referralPriority: 'high',
  },
  PNF: {
    code: 'PNF',
    name: 'Premature Nut Fall / Developmental Stress',
    shortLabel: 'Premature nut fall',
    category: 'physiological',
    causes:
      'Immature nuts can shed for many reasons: drought or water stress, broader palm stress, extreme weather, or physiological imbalance. Coconut Mite can also cause fall when scars are severe, so this outcome is used when fall is reported without a strong fruit-pest signature.',
    riskFactors: [
      'Recent drought or water stress',
      'Overall palm stress or poor growing conditions',
      'Many immature nuts falling without classic mite/rat/scale signs',
    ],
    whatHappensIfWorse:
      'Continued heavy shedding reduces yield. If an undetected pest or disease is driving fall, delay in whole-palm assessment can worsen losses.',
    whatToDoNow:
      'No strong fruit-specific pest signature was identified for the fall alone. Inspect the whole palm and growing conditions (water, nutrition, leaf health). If shedding continues, request agricultural assessment—fruit fall can result from problems outside the fruit itself.',
    prevention: [
      'Maintain steady water status where feasible',
      'Monitor young bunches during dry/wet extremes',
      'Re-check fallen nuts carefully for mite scars or gnaw marks',
    ],
    management: [
      'Do not force a pest diagnosis from fall alone',
      'Escalate if classic mite perianth scars or gnaw marks appear later',
    ],
    officerReferral: true,
    referralPriority: 'standard',
    conservative: true,
  },
  PHY: {
    code: 'PHY',
    name: 'Physical Fruit Damage',
    shortLabel: 'Physical damage',
    category: 'environmental',
    causes:
      'Storm impact, falling branches, harvesting or tool injury, or other mechanical force can scar nuts without disease or pest patterns.',
    riskFactors: [
      'Recent strong wind or storms',
      'Harvesting / tool contact',
      'Falling fronds or branches',
      'Isolated random impact points on individual fruits',
    ],
    whatHappensIfWorse:
      'Most mechanical scars stay cosmetic. Open wounds rarely match progressive mite lesions unless secondary pests or rot appear later.',
    whatToDoNow:
      'Review recent weather, harvesting, and field work. Monitor other nuts for classic perianth triangular scars or gnawing before assuming Coconut Mite or rats.',
    prevention: [
      'Careful harvesting technique',
      'Keep field clear of loose hanging hazards after storms',
    ],
    management: [
      'Do not treat isolated impact scars as Coconut Mite without perianth pattern',
    ],
    officerReferral: false,
    referralPriority: 'standard',
  },
}

export const FRUIT_DISCLAIMER =
  'This is a preliminary symptom-match tool based on expert rules aligned with CRI advisories. Scores are symptom match percentages, not laboratory probabilities. They do not replace field diagnosis by a qualified agricultural professional. Chemical recommendations can change—confirm current CRI/CDO guidance before applying products.'
