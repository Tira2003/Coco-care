export const LEAF_CONFIDENCE_REFINE_THRESHOLD = 0.8

export type LeafAreaOption =
  | 'older'
  | 'middle'
  | 'youngest'
  | 'most'
  | 'normal'
  | 'unsure'

export type LeafQuestionnaireState = {
  leafArea: LeafAreaOption | ''
  selectedSymptoms: string[]
  qSpotsBordered: 'yes' | 'no' | ''
  qUnevenYellowing: 'yes' | 'no' | ''
  qLeafletsBent: 'slightly' | 'severely' | 'no' | ''
  qSilkFrass: 'yes' | 'no' | ''
  qSpearRotten: 'yes' | 'no' | ''
  qNearbyPalms: 'yes' | 'no' | 'unsure' | ''
}

export const EMPTY_LEAF_QUESTIONNAIRE: LeafQuestionnaireState = {
  leafArea: '',
  selectedSymptoms: [],
  qSpotsBordered: '',
  qUnevenYellowing: '',
  qLeafletsBent: '',
  qSilkFrass: '',
  qSpearRotten: '',
  qNearbyPalms: '',
}

export const LEAF_AREA_OPTIONS: Array<{
  id: LeafAreaOption
  label: string
}> = [
  { id: 'older', label: 'Older, outer or lower leaves' },
  { id: 'middle', label: 'Middle leaves of the crown' },
  { id: 'youngest', label: 'Youngest unopened spear leaf' },
  { id: 'most', label: 'Most leaves throughout the crown' },
  { id: 'normal', label: 'No particular area; leaves appear normal' },
  { id: 'unsure', label: 'Not sure' },
]

export type SymptomGroup = {
  title: string
  note?: string
  symptoms: Array<{ id: string; label: string }>
}

export const LEAF_SYMPTOM_GROUPS: SymptomGroup[] = [
  {
    title: 'Gray Leaf Spot',
    note: 'Typical lesions have grey centres, dark margins and sometimes yellow halos.',
    symptoms: [
      { id: 'gls_oval_spots', label: 'Oval or irregular brown spots' },
      { id: 'gls_grey_centre', label: 'Spots have a grey or grey-white centre' },
      { id: 'gls_dark_border', label: 'Spots have a dark-brown border' },
      { id: 'gls_yellow_halo', label: 'Yellow halo around the spots' },
      {
        id: 'gls_merged_patches',
        label: 'Several spots have joined into larger dead patches',
      },
      {
        id: 'gls_blighted_older',
        label: 'Older leaves have a blighted or burnt appearance',
      },
      { id: 'gls_dry_tips', label: 'Tips or margins are dry and shrivelled' },
    ],
  },
  {
    title: 'WCLWD – Early Stage: Yellowing',
    symptoms: [
      {
        id: 'wclwd_e_uneven_yellow',
        label: 'Uneven yellowing is visible in the middle crown',
      },
      {
        id: 'wclwd_e_middle_yellow',
        label: 'Several middle fronds are becoming yellow',
      },
      {
        id: 'wclwd_e_irregular_patches',
        label: 'Yellowing occurs in irregular patches',
      },
      {
        id: 'wclwd_e_firm_leaflets',
        label: 'Leaflets remain mostly firm—not visibly bent',
      },
      {
        id: 'wclwd_e_little_drying',
        label: 'Little or no drying along leaflet margins',
      },
      {
        id: 'wclwd_e_no_other_damage',
        label: 'No grey-centred spots, rot or insect galleries',
      },
    ],
  },
  {
    title: 'WCLWD – Intermediate Stage: Flaccidity',
    symptoms: [
      {
        id: 'wclwd_i_bent_limp',
        label: 'Leaflets bend downward or appear abnormally limp',
      },
      {
        id: 'wclwd_i_flaccid',
        label: 'A ribbed or flaccid appearance is visible',
      },
      { id: 'wclwd_i_uneven_yellow', label: 'Uneven yellowing is also present' },
      {
        id: 'wclwd_i_middle_crown',
        label: 'Symptoms mainly affect middle-crown fronds',
      },
      {
        id: 'wclwd_i_early_drying',
        label: 'Early drying appears along leaflet margins',
      },
      { id: 'wclwd_i_reduced_vigour', label: 'Palm vigour appears reduced' },
    ],
  },
  {
    title: 'WCLWD – Advanced Stage: Drying',
    note: 'Prominent WCLWD signs: uneven yellowing, flaccidity and marginal necrosis.',
    symptoms: [
      {
        id: 'wclwd_a_margin_drying',
        label: 'Extensive drying or death along leaflet margins',
      },
      {
        id: 'wclwd_a_collapsed',
        label: 'Leaflets are strongly bent, limp or collapsed',
      },
      { id: 'wclwd_a_intense_yellow', label: 'Intense or widespread yellowing' },
      { id: 'wclwd_a_large_dried', label: 'Large portions of fronds have dried' },
      {
        id: 'wclwd_a_weak_crown',
        label: 'Crown appears smaller or weaker than normal',
      },
      {
        id: 'wclwd_a_decline',
        label: 'Nut production or general palm growth has declined',
      },
    ],
  },
  {
    title: 'Leaf Rot',
    note: 'Often begins with water-soaked brown lesions on the spear leaf.',
    symptoms: [
      {
        id: 'lr_water_soaked',
        label: 'Water-soaked brown lesions on the spear leaf',
      },
      { id: 'lr_soft_rotten', label: 'Young leaf tissue feels soft or rotten' },
      {
        id: 'lr_enlarge_join',
        label: 'Brown lesions enlarge and join together',
      },
      {
        id: 'lr_fall_away',
        label: 'Rotten portions fall away after the leaf opens',
      },
      {
        id: 'lr_fan_shape',
        label: 'Opened leaf has an abnormal fan-like shape',
      },
      { id: 'lr_spear_fail', label: 'Spear leaf fails to open normally' },
    ],
  },
  {
    title: 'Coconut Caterpillar Infestation — CCI',
    note: 'Black-headed caterpillars usually feed from the underside inside silk galleries.',
    symptoms: [
      {
        id: 'cci_scraped_underside',
        label: 'Green tissue has been scraped from the underside',
      },
      {
        id: 'cci_silk_galleries',
        label: 'Silk galleries or webbing under the leaflets',
      },
      {
        id: 'cci_frass',
        label: 'Caterpillar droppings or frass inside the galleries',
      },
      {
        id: 'cci_visible_insects',
        label: 'Caterpillars, larvae or pupae are visible',
      },
      {
        id: 'cci_dry_grey_lower',
        label: 'Dry grey patches occur mainly on lower leaves',
      },
      {
        id: 'cci_scorched_lower',
        label: 'Lower crown has a scorched appearance',
      },
    ],
  },
  {
    title: 'Healthy Coconut Leaf',
    note: 'Select positive healthy characteristics — do not use Healthy only because disease symptoms were not selected.',
    symptoms: [
      { id: 'healthy_even_green', label: 'Leaves have an even green colour' },
      {
        id: 'healthy_no_spots',
        label: 'No brown, grey or water-soaked spots',
      },
      { id: 'healthy_no_yellowing', label: 'No unusual or uneven yellowing' },
      {
        id: 'healthy_firm',
        label: 'Leaflets are firm and normally positioned',
      },
      { id: 'healthy_no_dry_margins', label: 'No dry or dead margins' },
      {
        id: 'healthy_no_insects',
        label: 'No feeding damage, galleries, frass or insects',
      },
      {
        id: 'healthy_spear_clean',
        label: 'Spear leaf is clean and opens normally',
      },
      {
        id: 'healthy_normal_growth',
        label: 'Crown growth and nut production appear normal',
      },
    ],
  },
]

export function questionnaireToSymptomsPayload(
  state: LeafQuestionnaireState,
): Record<string, string | boolean> {
  const payload: Record<string, string | boolean> = {}

  if (state.leafArea) {
    payload.leaf_area = state.leafArea
  }

  for (const id of state.selectedSymptoms) {
    payload[id] = true
  }

  if (state.qSpotsBordered) payload.q_spots_bordered = state.qSpotsBordered
  if (state.qUnevenYellowing) payload.q_uneven_yellowing = state.qUnevenYellowing
  if (state.qLeafletsBent) payload.q_leaflets_bent = state.qLeafletsBent
  if (state.qSilkFrass) payload.q_silk_frass = state.qSilkFrass
  if (state.qSpearRotten) payload.q_spear_rotten = state.qSpearRotten
  if (state.qNearbyPalms) payload.q_nearby_palms = state.qNearbyPalms

  return payload
}

export function getMatchLevelLabel(
  level: 'high' | 'moderate' | 'uncertain' | undefined,
  confidence: number,
): string {
  const resolved =
    level ?? (confidence >= 0.8 ? 'high' : confidence >= 0.6 ? 'moderate' : 'uncertain')
  if (resolved === 'high') return 'High symptom-supported match'
  if (resolved === 'moderate') return 'Moderate match—officer verification recommended'
  return 'Uncertain result—upload clearer images or contact an agriculture officer'
}

export function isQuestionnaireReady(state: LeafQuestionnaireState): boolean {
  return Boolean(state.leafArea) && state.selectedSymptoms.length >= 2
}
