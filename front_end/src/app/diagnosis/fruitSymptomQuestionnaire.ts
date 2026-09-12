/** Coconut fruit / nut questionnaire form config + payload mapping */

export type YnUnsure = 'yes' | 'no' | 'unsure' | ''

export interface FruitQuestionnaireState {
  fr_q1_age: string
  fr_q2_origin: string
  fr_q3_triangle: YnUnsure
  fr_q4_corky: YnUnsure
  fr_q5_downward: YnUnsure
  fr_q6_small: YnUnsure
  fr_q7_deformed: YnUnsure
  fr_q8_cracks: YnUnsure
  fr_q9_y_crack: YnUnsure
  fr_q10_gummy: YnUnsure
  fr_q11_scale: YnUnsure
  fr_q12_encrust: YnUnsure
  fr_q13_leaf_scale: YnUnsure
  fr_q14_gnaw: YnUnsure
  fr_q15_hole: YnUnsure
  fr_q16_kernel: YnUnsure
  fr_q17_rodents: YnUnsure
  fr_q18_scrape: YnUnsure
  fr_q19_brown_leaves: YnUnsure
  fr_q20_galleries: YnUnsure
  fr_q21_fall: string
  fr_q22_fallen_mite: YnUnsure
  fr_q23_fallen_gnaw: YnUnsure
  fr_q24_dry: YnUnsure
  fr_q25_drought: YnUnsure
  fr_q26_mechanical: YnUnsure
}

export const EMPTY_FRUIT_QUESTIONNAIRE: FruitQuestionnaireState = {
  fr_q1_age: '',
  fr_q2_origin: '',
  fr_q3_triangle: '',
  fr_q4_corky: '',
  fr_q5_downward: '',
  fr_q6_small: '',
  fr_q7_deformed: '',
  fr_q8_cracks: '',
  fr_q9_y_crack: '',
  fr_q10_gummy: '',
  fr_q11_scale: '',
  fr_q12_encrust: '',
  fr_q13_leaf_scale: '',
  fr_q14_gnaw: '',
  fr_q15_hole: '',
  fr_q16_kernel: '',
  fr_q17_rodents: '',
  fr_q18_scrape: '',
  fr_q19_brown_leaves: '',
  fr_q20_galleries: '',
  fr_q21_fall: '',
  fr_q22_fallen_mite: '',
  fr_q23_fallen_gnaw: '',
  fr_q24_dry: '',
  fr_q25_drought: '',
  fr_q26_mechanical: '',
}

export const FRUIT_STEPS = [
  { id: 'age', title: 'Nut age & lesion origin', hint: 'Age and where damage starts' },
  { id: 'mite', title: 'Mite-type scars', hint: 'Perianth patch, corky scar, cracks' },
  { id: 'scale_rat', title: 'Scale & gnawing', hint: 'Scale insects and rat damage' },
  { id: 'leaves', title: 'Leaf-related signs', hint: 'Caterpillar and fall patterns' },
  { id: 'history', title: 'History & stress', hint: 'Drought, fall scars, mechanical injury' },
] as const

export function fruitQuestionnaireToSymptomsPayload(
  q: FruitQuestionnaireState,
): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {}
  for (const [k, v] of Object.entries(q) as [keyof FruitQuestionnaireState, string][]) {
    if (v) out[k] = v
  }
  return out
}

export function isFruitQuestionnaireReady(q: FruitQuestionnaireState): boolean {
  const core = Boolean(q.fr_q1_age) && Boolean(q.fr_q2_origin)
  const depth =
    [
      q.fr_q3_triangle,
      q.fr_q4_corky,
      q.fr_q7_deformed,
      q.fr_q11_scale,
      q.fr_q14_gnaw,
      q.fr_q18_scrape,
      q.fr_q21_fall,
      q.fr_q25_drought,
      q.fr_q26_mechanical,
    ].filter((v) => v && v !== 'unsure').length >= 3
  return core && depth
}
