/** Stem & trunk questionnaire form config + payload mapping */

export type YnUnsure = 'yes' | 'no' | 'unsure' | ''

export interface StemQuestionnaireState {
  q1_age: string
  q2_liquid: string
  q3_longitudinal: YnUnsure
  q4_black_patches: YnUnsure
  q5_yellow: boolean
  q5_brown: boolean
  q5_fibrous: boolean
  q5_soft: boolean
  q5_peeling: boolean
  q5_answered: boolean
  q6_location: string
  q7_bracket: YnUnsure
  q8_holes: string
  q9_hole_location: string
  q10_frass: YnUnsure
  q11_viscous: YnUnsure
  q12_crunch: YnUnsure
  q13_cocoon: YnUnsure
  q14_vcuts: YnUnsure
  q15_bud_frass: YnUnsure
  q16_malformed: YnUnsure
  q17_flag_leaf: YnUnsure
  q18_mud: YnUnsure
  q19_termites: YnUnsure
  q20_bark_eaten: YnUnsure
  q21_yellowing: string
  q22_crown_weak: YnUnsure
  q23_injury: string
  q24_fire: YnUnsure
  q25_lightning: YnUnsure
  q26_flooding: string
  q27_fertiliser: YnUnsure
  q_visible_beetle: YnUnsure
}

export const EMPTY_STEM_QUESTIONNAIRE: StemQuestionnaireState = {
  q1_age: '',
  q2_liquid: '',
  q3_longitudinal: '',
  q4_black_patches: '',
  q5_yellow: false,
  q5_brown: false,
  q5_fibrous: false,
  q5_soft: false,
  q5_peeling: false,
  q5_answered: false,
  q6_location: '',
  q7_bracket: '',
  q8_holes: '',
  q9_hole_location: '',
  q10_frass: '',
  q11_viscous: '',
  q12_crunch: '',
  q13_cocoon: '',
  q14_vcuts: '',
  q15_bud_frass: '',
  q16_malformed: '',
  q17_flag_leaf: '',
  q18_mud: '',
  q19_termites: '',
  q20_bark_eaten: '',
  q21_yellowing: '',
  q22_crown_weak: '',
  q23_injury: '',
  q24_fire: '',
  q25_lightning: '',
  q26_flooding: '',
  q27_fertiliser: '',
  q_visible_beetle: '',
}

export const STEM_STEPS = [
  { id: 'palm', title: 'Palm information', hint: 'Age helps weight young-palm pests' },
  { id: 'bleeding', title: 'Trunk bleeding & tissue', hint: 'What fluid and bark changes you see' },
  { id: 'location', title: 'Where is the damage?', hint: 'Base, trunk, or crown' },
  { id: 'holes', title: 'Holes & insect signs', hint: 'Look and listen safely from the ground' },
  { id: 'pests', title: 'Beetle, weevil & termite signs', hint: 'Leaf cuts, mud runways, frass' },
  { id: 'history', title: 'Palm condition & history', hint: 'Injury, fire, flood, fertiliser' },
] as const

export function questionnaireToSymptomsPayload(
  q: StemQuestionnaireState,
): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {}
  const set = (k: keyof StemQuestionnaireState, v: string | boolean) => {
    if (typeof v === 'boolean') {
      if (v) out[k] = true
      return
    }
    if (v) out[k] = v
  }

  set('q1_age', q.q1_age)
  set('q2_liquid', q.q2_liquid)
  set('q3_longitudinal', q.q3_longitudinal)
  set('q4_black_patches', q.q4_black_patches)
  if (
    q.q5_yellow ||
    q.q5_brown ||
    q.q5_fibrous ||
    q.q5_soft ||
    q.q5_peeling ||
    q.q5_answered
  ) {
    out.q5_answered = 'yes'
  }
  if (q.q5_yellow) out.q5_yellow = true
  if (q.q5_brown) out.q5_brown = true
  if (q.q5_fibrous) out.q5_fibrous = true
  if (q.q5_soft) out.q5_soft = true
  if (q.q5_peeling) out.q5_peeling = true
  set('q6_location', q.q6_location)
  set('q7_bracket', q.q7_bracket)
  set('q8_holes', q.q8_holes)
  set('q9_hole_location', q.q9_hole_location)
  set('q10_frass', q.q10_frass)
  set('q11_viscous', q.q11_viscous)
  set('q12_crunch', q.q12_crunch)
  set('q13_cocoon', q.q13_cocoon)
  set('q14_vcuts', q.q14_vcuts)
  set('q15_bud_frass', q.q15_bud_frass)
  set('q16_malformed', q.q16_malformed)
  set('q17_flag_leaf', q.q17_flag_leaf)
  set('q18_mud', q.q18_mud)
  set('q19_termites', q.q19_termites)
  set('q20_bark_eaten', q.q20_bark_eaten)
  set('q21_yellowing', q.q21_yellowing)
  set('q22_crown_weak', q.q22_crown_weak)
  set('q23_injury', q.q23_injury)
  set('q24_fire', q.q24_fire)
  set('q25_lightning', q.q25_lightning)
  set('q26_flooding', q.q26_flooding)
  set('q27_fertiliser', q.q27_fertiliser)
  set('q_visible_beetle', q.q_visible_beetle)
  return out
}

/** Minimum useful answers before submit */
export function isStemQuestionnaireReady(q: StemQuestionnaireState): boolean {
  const core =
    Boolean(q.q1_age) &&
    Boolean(q.q2_liquid) &&
    Boolean(q.q6_location) &&
    Boolean(q.q8_holes)
  const depth =
    [
      q.q3_longitudinal,
      q.q4_black_patches,
      q.q7_bracket,
      q.q10_frass,
      q.q12_crunch,
      q.q14_vcuts,
      q.q18_mud,
      q.q19_termites,
      q.q22_crown_weak,
      q.q23_injury,
    ].filter((v) => v && v !== 'unsure').length >= 3
  return core && depth
}
