/**
 * Coconut Stem & Trunk diagnosis profiles (CRI-aligned for Sri Lanka).
 * Weights are expert-rule scores for COCO CARE, not CRI-published probabilities.
 */

export const STEM_CONDITION_CODES = ['STB', 'GAN', 'RPW', 'RBB', 'TER', 'ENV'] as const
export type StemConditionCode = (typeof STEM_CONDITION_CODES)[number]

export type StemConditionCategory = 'disease' | 'pest' | 'environmental'

export interface StemConditionProfile {
  code: StemConditionCode
  name: string
  shortLabel: string
  category: StemConditionCategory
  scientificNote?: string
  causes: string
  riskFactors: string[]
  whatHappensIfWorse: string
  whatToDoNow: string
  prevention: string[]
  management: string[]
  officerReferral: boolean
  referralPriority?: 'standard' | 'high' | 'urgent'
}

export const STEM_CONDITION_PROFILES: Record<StemConditionCode, StemConditionProfile> = {
  STB: {
    code: 'STB',
    name: 'Stem Bleeding Disease',
    shortLabel: 'Stem Bleeding',
    category: 'disease',
    scientificNote: 'Fungal form associated with Ceratocystis paradoxa (CRI stem bleeding circular).',
    causes:
      'The classic fungal form is associated with Ceratocystis paradoxa infection of stem tissues. Stem bleeding can also follow injury, flooding, or pest attack—so fungal stem bleeding is diagnosed only when the symptom pattern best matches after comparing alternatives.',
    riskFactors: [
      'Natural bark cracking on expanding young trunks',
      'Physical stem injuries or cuts',
      'Rapidly growing young stem bases',
      'Excess moisture or poor drainage',
      'Secondary colonisation of existing wounds',
    ],
    whatHappensIfWorse:
      'Bleeding patches may enlarge and join, underlying tissue decays into a brown fibrous mass, and the trunk weakens. Open wounds can later attract Red Palm Weevil.',
    whatToDoNow:
      'Protect the trunk, mark bleeding sites, photograph changes, and consult a Coconut Development or Agricultural Officer before cutting stem tissue or applying fungicides. Chemical registrations can change over time.',
    prevention: [
      'Avoid unnecessary knife cuts and trunk injury during maintenance',
      'Inspect natural cracks on young expanding trunks',
      'Correct serious drainage and waterlogging problems',
      'Monitor wounds for secondary Red Weevil activity',
    ],
    management: [
      'Under officer guidance, remove affected tissue carefully and treat wounds with approved copper / Bordeaux-type materials where still recommended',
      'Do not invent dosages from outdated circulars—confirm currently approved products',
      'Keep the plantation free of debris that harbours pests around damaged palms',
    ],
    officerReferral: true,
    referralPriority: 'standard',
  },
  GAN: {
    code: 'GAN',
    name: 'Ganoderma / Basal Stem Rot (possible)',
    shortLabel: 'Ganoderma',
    category: 'disease',
    scientificNote: 'CRI notes Ganoderma-associated basal bleeding is rare in Sri Lanka; bracket fruiting bodies are characteristic.',
    causes:
      'A Ganoderma fungus infects basal palm tissues and can produce basal stem bleeding and progressive trunk base decay.',
    riskFactors: [
      'Root and lower-stem injury',
      'Poor field sanitation with infected material',
      'Old stumps or decaying wood near palms',
      'Unfavourable soil moisture extremes',
    ],
    whatHappensIfWorse:
      'Progressive basal decay can weaken the palm and lead to severe decline. Ordinary stem-bleeding treatment alone may not control true Ganoderma infection.',
    whatToDoNow:
      'Treat this as high-priority suspicion if a bracket/shelf fungus is present at the base. Request professional confirmation and inspect neighbouring palms.',
    prevention: [
      'Avoid damaging roots and lower stems',
      'Remove and manage infected wood / stumps with local guidance',
      'Maintain field sanitation and good drainage',
      'Do not transfer soil or debris from symptomatic bases to healthy palms',
    ],
    management: [
      'Do not assume standard stem-bleeding treatment is enough',
      'Isolate debris from the suspect base until inspected',
      'Arrange officer inspection promptly if brackets or severe basal decay are present',
    ],
    officerReferral: true,
    referralPriority: 'high',
  },
  RPW: {
    code: 'RPW',
    name: 'Red Palm Weevil Infestation',
    shortLabel: 'Red Palm Weevil',
    category: 'pest',
    scientificNote: 'Rhynchophorus ferrugineus — larvae bore into trunk and bud tissues.',
    causes:
      'Adult weevils are attracted to fresh wounds and fermenting sap. Females lay eggs; larvae bore into fibrous trunk and bud tissues and may destroy the palm from inside before outer symptoms fully show.',
    riskFactors: [
      'Fresh cuts, tool wounds, or cracked bark',
      'Existing stem bleeding or black beetle injury',
      'Young palms (about 3–15 years) under heavy surveillance priority',
      'Poor detection of early holes and frass',
    ],
    whatHappensIfWorse:
      'Internal tissues are destroyed, the crown can wither, tilt, or collapse, and the palm may be lost. Damage is often worse inside than outside visible signs suggest.',
    whatToDoNow:
      'Arrange high-priority agricultural inspection. Avoid climbing a damaged palm. Follow CRI-recommended early detection and control approaches under professional advice.',
    prevention: [
      'Avoid unnecessary trunk wounds',
      'Inspect young palms regularly for holes, frass, fluid, and crown weakness',
      'Monitor previously injured palms carefully',
      'Use CRI-recommended monitoring / pheromone practices where available',
    ],
    management: [
      'Do not rely on partial external cues alone—request field inspection when indicators stack',
      'Handle insecticides only under supervision with currently registered products',
      'Check for co-occurring Black Beetle wounds that may have created entry points',
    ],
    officerReferral: true,
    referralPriority: 'urgent',
  },
  RBB: {
    code: 'RBB',
    name: 'Black / Rhinoceros Beetle Damage',
    shortLabel: 'Black Beetle',
    category: 'pest',
    scientificNote: 'Oryctes rhinoceros — adults bore soft tissue near the bud base.',
    causes:
      'Adult beetles bore into soft tissue around the base of the bud. Damage made while leaves are folded later appears as geometric or V-shaped cuts when leaves open. Fresh fibrous material/frass often marks the entrance.',
    riskFactors: [
      'Decaying coconut logs and stumps',
      'Large piles of decomposing organic matter',
      'Young plantations and seedlings with soft bud tissue',
      'Poor plantation hygiene',
    ],
    whatHappensIfWorse:
      'Growing point damage can kill seedlings; mature palms may show malformed leaves, broken flag leaf, and retarded growth. Wounds may later invite Red Palm Weevil.',
    whatToDoNow:
      'Inspect for Red Palm Weevil signs as well (holes, viscous fluid, crunching, cocoons). Clean breeding materials and consult an officer if the growing point is threatened.',
    prevention: [
      'Remove/dispose of decaying coconut logs and stumps appropriately',
      'Manage large organic waste piles',
      'Inspect young palms for bud holes and fresh frass',
      'Detect attack before the growing point is destroyed',
    ],
    management: [
      'Prioritise sanitation of breeding sites under local guidance',
      'Cross-check for Red Weevil when trunk wounds or crown holes exist',
      'Seek officer advice before insecticide use',
    ],
    officerReferral: true,
    referralPriority: 'standard',
  },
  TER: {
    code: 'TER',
    name: 'Termite Infestation',
    shortLabel: 'Termites',
    category: 'pest',
    scientificNote:
      'CRI notes termites across coconut-growing areas; some species build trunk runways and feed on bark (e.g. Nasutitermes).',
    causes:
      'Termite colonies in soil/mounds can attack roots, seedlings, and trunk bark. Mud runways and bark feeding are typical above-ground signs.',
    riskFactors: [
      'Dead wood and fallen plant material',
      'Termite mounds near the plantation',
      'Damaged mulch around seedlings',
      'Poor plantation sanitation',
    ],
    whatHappensIfWorse:
      'Bark peeling and tissue damage weaken the palm; seedlings may lose the central shoot. Extensive root or stem attack needs professional management.',
    whatToDoNow:
      'Remove or manage breeding material when safe to do so and request advice for extensive active infestation. Confirm currently registered control options with an officer.',
    prevention: [
      'Keep the plantation free of dead wood and breeding debris',
      'Manage mounds and hotspots with local recommendation',
      'Protect young seedlings carefully',
      'Avoid long-term piles of susceptible plant refuse near palms',
    ],
    management: [
      'Sanitation first; chemical control only under professional advice with currently legal products',
      'Protectes severely peeld trunk areas from secondary pests where possible',
    ],
    officerReferral: true,
    referralPriority: 'standard',
  },
  ENV: {
    code: 'ENV',
    name: 'Physical / Environmental Stem Damage',
    shortLabel: 'Environmental damage',
    category: 'environmental',
    scientificNote:
      'CRI lists lightning, fire, high fertilizer dose, flooding, and fluctuating water tables among alternative stem-bleeding causes.',
    causes:
      'Non-infectious damage from lightning, fire, flooding, water-table swings, chemical fertilizer burn, machinery/tools, or animals—not a primary fungal or pest pathogen.',
    riskFactors: [
      'Recent fire or lightning events',
      'Severe flooding or waterlogging',
      'Unusually high fertilizer applications',
      'Mechanical or animal trunk injury',
    ],
    whatHappensIfWorse:
      'Damaged tissue may continue to bleed or crack and can become entry points for Red Weevil or secondary decay if neglected.',
    whatToDoNow:
      'Address the environmental cause (drainage, avoid further fertiliser shock, protect wounds). Reassess if pest/fungal signature signs appear later.',
    prevention: [
      'Avoid trunk injury and over-fertilisation',
      'Improve drainage in flood-prone fields',
      'Protect young palms from fire and mechanical damage',
      'Monitor cracked or burned stems for secondary pests',
    ],
    management: [
      'Stabilize soil moisture when flooding/drought cycles are severe',
      'Do not treat as fungal stem bleeding solely because fluid is present',
      'Escalate to officer if structural safety or pest signs emerge',
    ],
    officerReferral: false,
    referralPriority: 'standard',
  },
}

export const STEM_DISCLAIMER =
  'This is a preliminary symptom-match tool based on expert rules aligned with CRI advisories. It is not a laboratory confirmation and does not replace field inspection by a qualified agricultural professional.'
