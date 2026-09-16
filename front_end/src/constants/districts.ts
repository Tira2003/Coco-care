export const SRI_LANKA_DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Galle',
  'Matara',
  'Hambantota',
  'Kurunegala',
  'Puttalam',
] as const

export type SriLankaDistrict = (typeof SRI_LANKA_DISTRICTS)[number]
