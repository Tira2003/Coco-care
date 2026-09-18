export type UserRole = 'farmer' | 'officer' | 'admin'

export interface User {
  id: string
  username: string
  name: string
  email?: string
  phone?: string
  role: UserRole
  isActive?: boolean
  officerId?: string
  assignedRegion?: string
}

export interface Farm {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  acreage: number
  treeCount: number
}

export interface AuthAccount {
  id: string
  username: string
  passwordHash: string
  name: string
  email: string | null
  phone: string | null
  role: UserRole
  isActive: boolean
  officerId: string | null
  assignedRegion: string | null
}

export type WeatherIcon = 'sun' | 'partly' | 'rain' | 'cloud'

export interface WeatherDay {
  day: string
  date: string
  high: number
  low: number
  rain?: number
  rainChance: number
  rainMm: number
  humidity: number
  windSpeed: number
  windDirection: string
  feelsLike: number
  description: string
  icon: WeatherIcon
}

export interface WeatherPeriodSummary {
  title: string
  period: string
  avgHigh: number
  avgLow: number
  totalRainMm: number
  rainDays: number
  dryDays: number
  avgHumidity: number
  avgWind: number
  sprayOkDays: number
  wettestDay: string
  headline: string
}

export interface WeatherForecast {
  location: string
  current: {
    temp: number
    feelsLike: number
    description: string
    humidity: number
    windSpeed: number
    windDirection: string
    rainChance: number
    pressure: number
    visibilityKm: number | null
    icon: WeatherIcon
  }
  days: WeatherDay[]
  farmingTip: string
  weekly?: WeatherPeriodSummary
  monthly?: WeatherPeriodSummary
}

export interface LeafPrediction {
  label: string
  probability: number
}

export interface StemDiagnosisDetail {
  code: string
  typeLabel: string
  matchScore: number
  matchBandLabel: string
  differentiation: string
  severity: string
  severityScore: number
  inconclusive: boolean
  evidence: string[]
  rankings: Array<{
    code: string
    name: string
    category: string
    matchScore: number
  }>
  cause: string
  riskFactors: string[]
  whatHappensIfWorse: string
  whatToDoNow: string
  prevention: string[]
  management: string[]
  officerReferral: boolean
  referralPriority?: string
  disclaimer: string
  rbbCrossCheckRpw?: boolean
  suggestLeafModule?: boolean
}

export interface DiagnosisResult {
  id: string
  category?: 'leaves' | 'stem' | 'bud' | 'fruit'
  imageResult: string
  symptomResult: string
  finalResult: string
  confidence: number
  status: 'verified' | 'pending'
  advice: string
  predictions?: LeafPrediction[]
  detectedEvidence?: string
  matchLevel?: 'high' | 'moderate' | 'uncertain'
  secondaryConditions?: string[]
  officerAlert?: string
  stemDetail?: StemDiagnosisDetail
  budDetail?: StemDiagnosisDetail
  fruitDetail?: StemDiagnosisDetail
}

export interface DiseaseReport {
  id: string
  farmId: string
  farmName: string
  region: string
  imageUrl?: string
  symptoms?: Record<string, string | boolean>
  imageResult?: string
  symptomResult?: string
  finalResult?: string
  confidence: number
  advice?: string
  status: 'verified' | 'pending' | 'rejected'
  createdAt: string
  reviewComment?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  conversationId: string
}

export interface ChatConversation {
  id: string
  title: string
  updatedAt: string
  createdAt: string
}

export type ConsultationStatus = 'open' | 'resolved'
export type ConsultationSender = 'farmer' | 'officer'
export type ConsultationInbox = 'needs_reply' | 'waiting' | 'resolved'

export interface ConsultationMessage {
  id: string
  consultationId: string
  senderRole: ConsultationSender
  senderUserId: string
  content: string
  createdAt: string
}

export interface ConsultationSummary {
  id: string
  topic: string
  status: ConsultationStatus
  lastSender: ConsultationSender
  inbox: ConsultationInbox
  district: string
  farmId?: string
  farmName?: string
  reportId?: string
  reportLabel?: string
  farmerName: string
  officerName?: string
  lastMessage: string
  createdAt: string
  updatedAt: string
}

export interface ConsultationThread extends ConsultationSummary {
  farmerPhone?: string
  reportStatus?: string
  messages: ConsultationMessage[]
}

export interface KnowledgeArticle {
  id: string
  title: string
  source: string
  content: string
  sourceUrl?: string | null
}

export type VerificationStatus = 'verified' | 'ai_suspected'
export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical'

export interface HeatmapPoint {
  lat: number
  lng: number
  weight: number
  diseaseType: string
  verificationStatus: VerificationStatus
  threatLevel: ThreatLevel
  createdAt?: string
  reportId?: string
  farmId?: string
  farmName?: string
  district?: string
  count?: number
}

export interface DiseaseAlert {
  id: string
  reportId: string
  farmId: string
  diseaseType: string
  alertType: VerificationStatus
  distanceKm: number
  message: string
  read: boolean
  createdAt: string
  severity: ThreatLevel
}

export interface NearbyOutbreak {
  lat: number
  lng: number
  diseaseType: string
  weight: number
  distanceKm: number
  reportId: string
  farmId: string
  verificationStatus: VerificationStatus
  threatLevel: ThreatLevel
  createdAt: string
}

export interface NearbyResponse {
  radiusKm: number
  farms: Array<{
    farmId: string
    farmName: string
    lat: number
    lng: number
    outbreaks: NearbyOutbreak[]
  }>
  nearest: {
    diseaseType: string
    distanceKm: number
    farmName: string
    threatLevel: ThreatLevel
    verificationStatus: VerificationStatus
  } | null
}

export interface DiseaseMapStats {
  byDisease: Array<{ diseaseType: string; count: number }>
  byWeek: Array<{ week: string; count: number }>
  highRiskCount: number
}
