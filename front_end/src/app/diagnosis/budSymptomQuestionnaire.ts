/** Bud & crown questionnaire form config + payload mapping */

export type YnUnsure = 'yes' | 'no' | 'unsure' | ''

export interface BudQuestionnaireState {
  bc_q1_age: string
  bc_q2_spear: string
  bc_q3_pullable: YnUnsure
  bc_q4_spear_base: string
  bc_q5_soft_rot: YnUnsure
  bc_q6_foul: YnUnsure
  bc_q7_bud_fall: YnUnsure
  bc_q8_holes: string
  bc_q9_hole_loc: string
  bc_q10_frass: YnUnsure
  bc_q11_viscous: YnUnsure
  bc_q12_crunch: YnUnsure
  bc_q13_cocoon: YnUnsure
  bc_q14_vcuts: YnUnsure
  bc_q15_bud_frass: YnUnsure
  bc_q16_crooked: YnUnsure
  bc_q17_flag: YnUnsure
  bc_q18_brown_patches: YnUnsure
  bc_q19_superficial: YnUnsure
  bc_q20_insects: YnUnsure
  bc_q21_tilt: YnUnsure
  bc_q22_fronds: string
  bc_q23_lower_green: YnUnsure
  bc_q24_nut_fall: YnUnsure
  bc_q25_infloresc: YnUnsure
  bc_q26_humidity: YnUnsure
  bc_q27_flood: YnUnsure
  bc_q28_shade: YnUnsure
  bc_q29_wound: YnUnsure
  bc_q30_physical: YnUnsure
  /** Leaflet-surface damage on older fronds → suggest Leaf module */
  bc_leaflet_surface: YnUnsure
}

export const EMPTY_BUD_QUESTIONNAIRE: BudQuestionnaireState = {
  bc_q1_age: '',
  bc_q2_spear: '',
  bc_q3_pullable: '',
  bc_q4_spear_base: '',
  bc_q5_soft_rot: '',
  bc_q6_foul: '',
  bc_q7_bud_fall: '',
  bc_q8_holes: '',
  bc_q9_hole_loc: '',
  bc_q10_frass: '',
  bc_q11_viscous: '',
  bc_q12_crunch: '',
  bc_q13_cocoon: '',
  bc_q14_vcuts: '',
  bc_q15_bud_frass: '',
  bc_q16_crooked: '',
  bc_q17_flag: '',
  bc_q18_brown_patches: '',
  bc_q19_superficial: '',
  bc_q20_insects: '',
  bc_q21_tilt: '',
  bc_q22_fronds: '',
  bc_q23_lower_green: '',
  bc_q24_nut_fall: '',
  bc_q25_infloresc: '',
  bc_q26_humidity: '',
  bc_q27_flood: '',
  bc_q28_shade: '',
  bc_q29_wound: '',
  bc_q30_physical: '',
  bc_leaflet_surface: '',
}

export const BUD_STEPS = [
  { id: 'palm', title: 'Palm & spear leaf', hint: 'Age and central spear condition' },
  { id: 'rot', title: 'Bud rot signs', hint: 'Soft tissue, smell, spear base' },
  { id: 'holes', title: 'Holes & fluids', hint: 'Crown entry, frass, viscous fluid' },
  { id: 'pests', title: 'Weevil & beetle signs', hint: 'Sounds, cocoons, V-cuts, frass' },
  { id: 'plesspa', title: 'Young leaf & crown', hint: 'Brown patches, tilt, lower leaves' },
  { id: 'history', title: 'History & risk', hint: 'Humidity, flood, wounds, physical injury' },
] as const

export function budQuestionnaireToSymptomsPayload(
  q: BudQuestionnaireState,
): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {}
  for (const [k, v] of Object.entries(q) as [keyof BudQuestionnaireState, string][]) {
    if (v) out[k] = v
  }
  return out
}

export function isBudQuestionnaireReady(q: BudQuestionnaireState): boolean {
  const core = Boolean(q.bc_q1_age) && Boolean(q.bc_q2_spear) && Boolean(q.bc_q8_holes)
  const depth =
    [
      q.bc_q3_pullable,
      q.bc_q5_soft_rot,
      q.bc_q6_foul,
      q.bc_q10_frass,
      q.bc_q12_crunch,
      q.bc_q14_vcuts,
      q.bc_q18_brown_patches,
      q.bc_q21_tilt,
      q.bc_q29_wound,
      q.bc_q30_physical,
    ].filter((v) => v && v !== 'unsure').length >= 3
  return core && depth
}
