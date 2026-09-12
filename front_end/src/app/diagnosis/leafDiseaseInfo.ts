export interface DiseaseProgressionStage {
  stage: string
  symptoms: string[]
}

export interface QuickFact {
  property: string
  information: string
}

export interface LeafDiseaseInfo {
  category: string
  diseaseStage?: string
  severity?: string
  description: string[]
  causalOrganism?: string
  causes: string[]
  symptoms: string[]
  diseaseProgression?: DiseaseProgressionStage[]
  favorableConditions?: string[]
  impact?: string[]
  prevention: string[]
  management: string[]
  recommendedAction?: string[]
  userGuideline: string
  quickFacts?: QuickFact[]
}

export const LEAF_DISEASE_INFO: Record<string, LeafDiseaseInfo> = {
  'Coconut Caterpillar Infestation (CCI)': {
    category: 'Insect Pest',
    description: [
      'Coconut Caterpillar Infestation (CCI) is a common pest problem affecting coconut leaves. The infestation occurs when caterpillar larvae feed on the leaflets, damaging the leaf tissue and reducing the tree\'s ability to perform photosynthesis.',
      'Severe infestations can weaken the coconut palm, reduce flowering, lower coconut yield, and make the tree more vulnerable to other diseases and environmental stress.',
      'In the ML model, CCI represents Coconut Caterpillar Infestation, whether caterpillar presence or feeding damage on leaflets is detected.',
    ],
    causalOrganism: 'Caterpillar larvae (immature stage of moths) that feed on coconut leaves.',
    causes: [
      'Adult moths laying eggs on coconut leaves',
      'Lack of regular plantation monitoring',
      'Absence of natural predators',
      'Poor plantation sanitation',
      'Uncontrolled pest population',
      'Warm climatic conditions favouring pest development',
    ],
    symptoms: [
      'Holes in leaflets',
      'Chewed or eaten leaf edges',
      'Skeletonized leaves (only veins remain)',
      'Brown feeding marks',
      'Irregular damaged leaflets',
      'Visible caterpillars or larvae on leaves',
      'Presence of insect droppings (frass)',
      'Silk threads or webbing on leaves',
      'Reduced green leaf area',
    ],
    diseaseProgression: [
      {
        stage: 'Early Stage',
        symptoms: [
          'Small feeding holes appear',
          'A few caterpillars may be visible',
          'Minor chewing damage',
        ],
      },
      {
        stage: 'Intermediate Stage',
        symptoms: [
          'Larger holes develop',
          'Multiple leaflets become damaged',
          'Caterpillar population increases',
          'Leaves lose more green tissue',
        ],
      },
      {
        stage: 'Advanced Stage',
        symptoms: [
          'Severe feeding damage',
          'Large portions of leaves destroyed',
          'Photosynthesis greatly reduced',
          'Tree becomes weak',
          'Coconut production decreases',
        ],
      },
    ],
    favorableConditions: [
      'Warm temperatures',
      'Poor plantation sanitation',
      'Lack of biological pest control',
      'Absence of regular field inspections',
      'Heavy pest populations in nearby plantations',
    ],
    impact: [
      'Reduced photosynthesis',
      'Slower tree growth',
      'Reduced flowering',
      'Lower coconut yield',
      'Weakening of young coconut palms',
      'Increased susceptibility to secondary diseases',
    ],
    prevention: [
      'Inspect coconut leaves every 2–4 weeks for caterpillars, eggs, and feeding damage',
      'Remove heavily infested leaves and destroy them properly',
      'Protect beneficial insects, birds, and parasitoids',
      'Remove weeds and unnecessary vegetation',
      'Monitor newly emerging leaves and both surfaces of leaflets',
      'Follow CRI or local authority recommendations for pest management when severe',
    ],
    management: [
      'Inspect the entire tree to determine infestation extent',
      'Remove severely damaged leaves when practical',
      'Destroy leaves containing large numbers of caterpillars',
      'Monitor nearby coconut palms',
      'Encourage natural predators',
      'Apply approved pest control if infestation exceeds economic thresholds',
    ],
    userGuideline:
      'Your image is classified as Coconut Caterpillar Infestation (CCI). Inspect the entire tree for caterpillars, eggs, or fresh feeding damage. Check nearby palms, remove heavily infested leaves if practical, and seek extension officer advice if the infestation spreads.',
    quickFacts: [
      { property: 'Category', information: 'Insect Pest' },
      { property: 'Affected Part', information: 'Coconut Leaves' },
      { property: 'Main Cause', information: 'Feeding by caterpillar larvae' },
      { property: 'Risk Level', information: 'Medium to High' },
      { property: 'Early Detection', information: 'Very Important' },
      { property: 'Can It Be Controlled?', information: 'Yes, with early monitoring and good hygiene' },
    ],
  },

  'Weligama Coconut Leaf Wilt – Early Stage (Yellowing)': {
    category: 'Phytoplasma Disease',
    diseaseStage: 'Early Stage – Yellowing',
    severity: '🟢 Low to Moderate',
    description: [
      'This is the early stage of Weligama Coconut Leaf Wilt Disease (WCLWD). The disease begins by causing older leaves to lose their normal green colour and gradually turn pale green or yellow.',
      'At this stage the palm may still appear healthy overall, making early detection difficult. Timely identification and monitoring are important to reduce further spread.',
    ],
    causalOrganism: 'Phytoplasma spread through suspected sap-feeding insect vectors.',
    causes: [
      'Infection by phytoplasma',
      'Spread through insect vectors',
      'Planting infected seedlings',
      'Natural spread from infected nearby coconut palms',
    ],
    symptoms: [
      'Yellowing of older leaves',
      'Pale green leaflets',
      'Slight reduction in leaf brightness',
      'Mild reduction in tree vigour',
      'Early decline in coconut production',
      'Leaves remain firm without drooping',
    ],
    prevention: [
      'Inspect coconut palms regularly',
      'Use certified healthy seedlings',
      'Maintain balanced fertilization',
      'Monitor nearby trees for similar symptoms',
      'Report suspected cases to agricultural officers',
    ],
    recommendedAction: [
      'Continue monitoring the tree every few weeks',
      'Record any increase in yellowing',
      'Inspect neighbouring palms',
      'Avoid transporting seedlings from infected areas',
    ],
    management: [
      'Monitor disease progression closely',
      'Record changes in leaf colour over time',
      'Inspect surrounding palms in the plantation',
      'Consult agricultural officers if symptoms worsen',
    ],
    userGuideline:
      'Your image shows early-stage WCLWD (Yellowing). Continue monitoring closely. If leaf drooping or drying develops, seek advice from CRI Sri Lanka or your local agricultural extension office.',
    quickFacts: [
      { property: 'Disease', information: 'Weligama Coconut Leaf Wilt Disease (WCLWD)' },
      { property: 'Stage', information: 'Early – Yellowing' },
      { property: 'Severity', information: 'Low to Moderate' },
      { property: 'Early Detection', information: 'Critical' },
    ],
  },

  'Weligama Coconut Leaf Wilt – Intermediate Stage (Flaccidity)': {
    category: 'Phytoplasma Disease',
    diseaseStage: 'Intermediate Stage – Flaccidity (Leaf Drooping)',
    severity: '🟠 Moderate to High',
    description: [
      'This is the intermediate stage of Weligama Coconut Leaf Wilt Disease. The disease has progressed beyond yellowing, causing leaves to lose their natural stiffness and begin drooping.',
      'The tree\'s overall health and coconut production decline noticeably at this stage.',
    ],
    causalOrganism: 'Continued phytoplasma infection spread by insect vectors.',
    causes: [
      'Continued phytoplasma infection',
      'Spread by insect vectors',
      'Progression of untreated early-stage disease',
    ],
    symptoms: [
      'Leaves become soft and droop downward',
      'Leaflets lose their natural stiffness',
      'Crown appears weak',
      'Yellowing becomes more noticeable',
      'Reduced flowering',
      'Lower coconut production',
      'Slower tree growth',
    ],
    prevention: [
      'Regular plantation inspections',
      'Maintain tree nutrition',
      'Monitor surrounding palms',
      'Avoid moving seedlings from infected areas',
      'Follow recommendations from agricultural authorities',
    ],
    recommendedAction: [
      'Continue observing disease progression',
      'Inspect nearby palms for similar symptoms',
      'Record changes in crown and leaf condition',
      'Consult agricultural experts for confirmation',
    ],
    management: [
      'Monitor the palm and neighbouring trees weekly',
      'Document symptom spread across fronds',
      'Seek professional agricultural advice promptly',
      'Follow CRI guidance for wilt management in your region',
    ],
    userGuideline:
      'Your image indicates intermediate-stage WCLWD (Flaccidity). The disease has progressed and may continue to reduce tree health and coconut production. Monitor carefully and seek professional agricultural advice.',
    quickFacts: [
      { property: 'Disease', information: 'Weligama Coconut Leaf Wilt Disease (WCLWD)' },
      { property: 'Stage', information: 'Intermediate – Flaccidity' },
      { property: 'Severity', information: 'Moderate to High' },
      { property: 'Action Required', information: 'Immediate monitoring and expert consultation' },
    ],
  },

  'Weligama Coconut Leaf Wilt – Advanced Stage (Drying of Leaflets)': {
    category: 'Phytoplasma Disease',
    diseaseStage: 'Advanced Stage – Drying of Leaflets',
    severity: '🔴 High',
    description: [
      'This is the advanced stage of Weligama Coconut Leaf Wilt Disease. Leaflets become dry and brown as the disease severely disrupts nutrient transport within the palm.',
      'The tree becomes significantly weakened, coconut production declines sharply, and long-term survival is greatly affected.',
    ],
    causalOrganism: 'Advanced phytoplasma infection from long-term disease progression.',
    causes: [
      'Advanced phytoplasma infection',
      'Continued disease progression',
      'Long-term infection without effective management',
    ],
    symptoms: [
      'Dry, brown leaflets',
      'Leaf drying begins from the tips',
      'Sparse and unhealthy crown',
      'Significant reduction in coconut production',
      'Weak overall tree growth',
      'Severe decline in tree vigour',
    ],
    prevention: [
      'Detect and manage WCLWD during early stages',
      'Use healthy planting materials',
      'Regularly inspect coconut plantations',
      'Follow CRI Sri Lanka recommendations',
    ],
    recommendedAction: [
      'Inspect the entire plantation for affected palms',
      'Avoid transporting planting material from infected areas',
      'Consult agricultural authorities regarding management options',
      'If recommended, remove severely affected palms to reduce spread',
    ],
    management: [
      'Seek immediate consultation with CRI or extension officers',
      'Assess spread risk to neighbouring palms',
      'Follow official guidance on palm removal if required',
      'Continue surveillance across the plantation',
    ],
    userGuideline:
      'Your image indicates advanced-stage WCLWD. The disease has caused severe damage. Immediate consultation with CRI Sri Lanka or local agricultural extension officers is recommended to determine the most appropriate management strategy.',
    quickFacts: [
      { property: 'Disease', information: 'Weligama Coconut Leaf Wilt Disease (WCLWD)' },
      { property: 'Stage', information: 'Advanced – Drying of Leaflets' },
      { property: 'Severity', information: 'High' },
      { property: 'Action Required', information: 'Urgent expert consultation' },
    ],
  },

  'Leaf Rot': {
    category: 'Fungal Disease',
    description: [
      'Leaf Rot is a common fungal disease of coconut palms that affects the leaflets, causing them to rot, dry, and eventually die. The disease usually begins as small water-soaked or brown lesions that gradually spread across the leaf tissue.',
      'As the infection progresses, affected leaves lose their ability to perform photosynthesis efficiently, weakening the tree and reducing coconut production.',
      'Leaf Rot is particularly common in areas with high rainfall, excessive humidity, and poor plantation sanitation.',
    ],
    causalOrganism:
      'Fungal pathogens, most commonly species of Colletotrichum, Exserohilum, and other fungi associated with leaf decay in coconut palms.',
    causes: [
      'High humidity',
      'Frequent rainfall',
      'Poor drainage',
      'Prolonged moisture on leaves',
      'Poor air circulation',
      'Infected plant debris',
      'Lack of plantation sanitation',
      'Weak or nutrient-deficient coconut palms',
    ],
    symptoms: [
      'Brown or dark brown patches on leaflets',
      'Water-soaked lesions during the early stage',
      'Soft, rotting leaf tissues',
      'Drying and browning of leaf tips',
      'Leaflets becoming brittle and breaking easily',
      'Leaves appearing scorched or burned',
      'Premature drying of affected leaves',
      'Reduced green leaf area',
    ],
    diseaseProgression: [
      {
        stage: 'Early Stage',
        symptoms: [
          'Small brown or water-soaked spots appear',
          'Slight discoloration of leaf tissue',
          'Infection limited to small areas',
        ],
      },
      {
        stage: 'Intermediate Stage',
        symptoms: [
          'Brown lesions enlarge',
          'Leaf tissue becomes soft and begins to rot',
          'Multiple leaflets become infected',
          'Drying starts from infected areas',
        ],
      },
      {
        stage: 'Advanced Stage',
        symptoms: [
          'Large portions of leaves become dry and dead',
          'Leaflets tear and break easily',
          'Photosynthesis significantly reduced',
          'Tree growth slows',
          'Coconut production decreases',
        ],
      },
    ],
    favorableConditions: [
      'Warm temperatures',
      'High humidity',
      'Continuous rainfall',
      'Poor drainage',
      'Dense plantations with poor ventilation',
      'Wet leaves for extended periods',
    ],
    impact: [
      'Reduced photosynthesis',
      'Slower overall tree growth',
      'Reduced flowering and fruit production',
      'Weakened coconut palm',
      'Increased susceptibility to secondary fungal infections',
      'Reduced coconut yield and quality',
    ],
    prevention: [
      'Prune and safely dispose of infected leaves',
      'Maintain proper spacing and remove excessive vegetation',
      'Prevent waterlogging and ensure efficient drainage',
      'Remove fallen leaves and infected plant debris regularly',
      'Apply balanced fertilizer to strengthen tree resistance',
      'Inspect palms frequently during rainy seasons',
      'Apply appropriate fungicide per CRI or local authority recommendations when severe',
    ],
    management: [
      'Remove severely infected leaves',
      'Destroy infected plant material away from the plantation',
      'Improve field sanitation',
      'Improve drainage and reduce excess moisture',
      'Increase air circulation through proper pruning and spacing',
      'Apply recommended fungicides when necessary',
      'Continue monitoring surrounding coconut palms',
    ],
    userGuideline:
      'Your image is classified as Leaf Rot. Inspect all leaves on the affected tree, remove heavily infected leaves, improve drainage, keep the plantation clean, and contact agricultural officers if the disease spreads rapidly despite management.',
    quickFacts: [
      { property: 'Disease Type', information: 'Fungal Disease' },
      { property: 'Affected Part', information: 'Coconut Leaves' },
      { property: 'Main Cause', information: 'Fungal infection under humid and wet conditions' },
      { property: 'Risk Level', information: 'Medium to High' },
      { property: 'Early Detection', information: 'Very High importance' },
      { property: 'Can It Be Controlled?', information: 'Yes, with early detection and good sanitation' },
    ],
  },

  'Gray Leaf Spot': {
    category: 'Fungal Disease',
    description: [
      'Gray Leaf Spot is a fungal disease that causes grayish or ash-coloured spots and patches on coconut leaflets. The spots may enlarge and merge, weakening the leaf and reducing photosynthetic capacity.',
      'It is common in humid plantations with poor air circulation and prolonged leaf wetness.',
    ],
    causalOrganism: 'Fungal pathogens causing gray leaf spot on coconut foliage.',
    causes: [
      'Fungal spores spread by rain splash and wind',
      'High humidity and prolonged leaf wetness',
      'Poor air circulation in dense plantations',
      'Nutrient stress weakening leaf resistance',
      'Infected plant debris in the plantation',
    ],
    symptoms: [
      'Gray or ash-coloured spots on leaflets',
      'Irregular discoloured patches on leaves',
      'Spots enlarging and merging over time',
      'Premature yellowing of affected areas',
      'Reduced healthy green leaf area',
    ],
    prevention: [
      'Prune affected leaves and destroy infected material',
      'Improve air circulation through proper spacing',
      'Avoid overhead irrigation onto the crown',
      'Maintain balanced nutrition for palm vigour',
      'Sanitise cutting tools between palms',
      'Remove fallen infected fronds regularly',
    ],
    management: [
      'Remove affected leaf portions promptly',
      'Improve plantation ventilation',
      'Apply fungicide per officer or CRI recommendation if severe',
      'Monitor nearby palms for early signs',
    ],
    userGuideline:
      'Your image is classified as Gray Leaf Spot. Remove affected leaf material, improve air flow around the crown, and monitor neighbouring palms. Seek officer advice if spots spread quickly.',
    quickFacts: [
      { property: 'Disease Type', information: 'Fungal Disease' },
      { property: 'Affected Part', information: 'Coconut Leaves' },
      { property: 'Risk Level', information: 'Low to Moderate' },
      { property: 'Can It Be Controlled?', information: 'Yes, with sanitation and early management' },
    ],
  },

  'Healthy Coconut Leaf': {
    category: 'Healthy',
    description: [
      'The analysed coconut leaf shows no strong signs of the trained disease classes. The palm appears healthy based on the model prediction.',
      'Continue good plantation practices to maintain tree vigour and productivity.',
    ],
    causes: [
      'No significant disease symptoms detected in the image',
      'Good plantation management and nutrition',
      'Low pest and disease pressure in the area',
    ],
    symptoms: [
      'Normal green leaf colour',
      'No significant lesions, holes, or wilting',
      'Leaflets appear firm and intact',
    ],
    prevention: [
      'Continue regular field scouting and monitoring',
      'Maintain recommended fertiliser and irrigation practices',
      'Keep plantation hygiene and remove old fronds routinely',
      'Re-check if new symptoms appear on other fronds',
    ],
    management: [
      'Maintain current good management practices',
      'Monitor during rainy seasons for early disease signs',
      'Record baseline health for future comparison',
    ],
    userGuideline:
      'Your leaf appears healthy. Continue regular monitoring and maintain balanced nutrition, drainage, and sanitation across the plantation.',
    quickFacts: [
      { property: 'Status', information: 'Healthy Coconut Leaf' },
      { property: 'Action', information: 'Continue routine monitoring' },
      { property: 'Risk Level', information: 'Low' },
    ],
  },
}

const LABEL_ALIASES: Record<string, string> = {
  'Coconut Caterpillar Infestation': 'Coconut Caterpillar Infestation (CCI)',
  'WCLWD Yellowing': 'Weligama Coconut Leaf Wilt – Early Stage (Yellowing)',
  'WCLWD Flaccidity': 'Weligama Coconut Leaf Wilt – Intermediate Stage (Flaccidity)',
  'WCLWD Drying of Leaflets': 'Weligama Coconut Leaf Wilt – Advanced Stage (Drying of Leaflets)',
  'Gray Leaf Rot': 'Gray Leaf Spot',
  'Healthy Leaves': 'Healthy Coconut Leaf',
}

export function getLeafDiseaseInfo(label: string): LeafDiseaseInfo | null {
  const key = LABEL_ALIASES[label] ?? label
  return LEAF_DISEASE_INFO[key] ?? null
}
