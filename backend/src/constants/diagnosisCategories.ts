export const DIAGNOSIS_CATEGORIES = [
  'leaves',
  'stem',
  'bud',
  'fruit',
] as const

export type DiagnosisCategory = (typeof DIAGNOSIS_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<DiagnosisCategory, string> = {
  leaves: 'Coconut Leaves & Leaflets',
  stem: 'Coconut Stem & Trunk',
  bud: 'Coconut Bud & Crown',
  fruit: 'Coconut Fruit',
}

export interface CategoryDisease {
  name: string
  symptoms: string[]
}

export const CATEGORY_DISEASES: Record<Exclude<DiagnosisCategory, 'leaves'>, CategoryDisease[]> = {
  stem: [
    {
      name: 'Stem Bleeding Disease',
      symptoms: [
        'Reddish-brown rust liquid',
        'Longitudinal bark cracks',
        'Black dried patches',
        'Brown fibrous decay',
      ],
    },
    {
      name: 'Ganoderma / Basal Stem Rot',
      symptoms: [
        'Bracket fungus at base',
        'Basal bleeding',
        'Basal tissue decay',
        'General palm decline',
      ],
    },
    {
      name: 'Red Palm Weevil Infestation',
      symptoms: [
        'Circular trunk/crown holes',
        'Chewed fibres / frass',
        'Brown viscous fluid',
        'Internal crunching sounds',
      ],
    },
    {
      name: 'Black / Rhinoceros Beetle Damage',
      symptoms: [
        'Bud/crown entry hole',
        'Fresh frass at entrance',
        'V-shaped leaf cuts',
        'Malformed young leaves',
      ],
    },
    {
      name: 'Termite Infestation',
      symptoms: [
        'Mud runways on trunk',
        'Visible termites',
        'Bark peeling / eaten',
        'Weak tissue beneath bark',
      ],
    },
  ],
  bud: [
    {
      name: 'Bud Rot Disease',
      symptoms: [
        'Wilting / pullable spear leaf',
        'Soft rotten bud tissue',
        'Foul smell from crown',
        'Lower leaves still green',
      ],
    },
    {
      name: 'Red Palm Weevil Infestation',
      symptoms: [
        'Crown holes with frass',
        'Brown viscous fluid',
        'Internal crunching',
        'Fibrous cocoons / tilting bud',
      ],
    },
    {
      name: 'Black / Rhinoceros Beetle Damage',
      symptoms: [
        'Bud entry hole with frass',
        'V-shaped leaf cuts',
        'Crooked young leaves',
        'Broken flag leaf',
      ],
    },
    {
      name: 'Plesispa Beetle Infestation',
      symptoms: [
        'Brown patches on bud leaves',
        'Superficial young-leaf feeding',
        'Primarily seedlings / young palms',
        'No deep crown boring',
      ],
    },
  ],
  fruit: [
    {
      name: 'Coconut Mite Infestation',
      symptoms: [
        'Pale triangular patch below perianth',
        'Corky brown scar expanding downward',
        'Deformed / small nut',
        'Y-shaped cracks / premature fall',
      ],
    },
    {
      name: 'Coconut Scale on Nuts',
      symptoms: [
        'Tiny scale insects on nut surface',
        'Yellow-white encrustation',
        'Scale outbreak also on nearby leaves',
        'Worse in dry weather',
      ],
    },
    {
      name: 'Rat / Mammalian Nut Damage',
      symptoms: [
        'Clear gnaw / bite marks',
        'Hole through husk',
        'Kernel eaten / nut water lost',
        'Rodent activity near palms',
      ],
    },
    {
      name: 'Caterpillar-related Nut Surface Damage',
      symptoms: [
        'Shallow epidermis scraping',
        'Brown dried lower leaves',
        'Galleries on leaf undersides',
        'No deep perianth mite scar',
      ],
    },
    {
      name: 'Premature Nut Fall / Stress',
      symptoms: [
        'Many immature nuts falling',
        'No strong mite scars',
        'No gnaw marks',
        'Drought / water stress history',
      ],
    },
  ],
}
