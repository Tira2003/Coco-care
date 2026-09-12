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
  /** Present on admin user list — last admin-assigned password. */
  password?: string | null
}

export interface AdminFarm {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  acreage: number
  treeCount: number
  ownerId: string
  ownerName: string
  ownerUsername: string
}

export interface RegionSummary {
  region: string
  pending: number
  verified: number
  rejected: number
  total: number
}

export interface SystemHealth {
  database: boolean
  geminiEmbedding: boolean
  groq: boolean
  knowledgeDocuments: number
  knowledgeChunks: number
}

export type NotificationAudience = 'all' | 'farmers' | 'officers'

export interface AppNotification {
  id: string
  title: string
  message: string
  audience: NotificationAudience
  createdBy?: string | null
  createdAt: string
  read: boolean
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

export interface DiseaseReport {
  id: string
  farmId: string
  farmName: string
  region: string
  farmer?: {
    id: string
    name: string
    username: string
    email?: string | null
    phone?: string | null
  }
  farm?: {
    id: string
    name: string
    location: string
    latitude: number
    longitude: number
    acreage: number
    treeCount: number
  }
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

export type VerificationStatus = 'verified' | 'ai_suspected'

export interface HeatmapPoint {
  lat: number
  lng: number
  weight: number
  diseaseType: string
  verificationStatus: VerificationStatus
  createdAt?: string
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
}

export interface NearbyOutbreak {
  lat: number
  lng: number
  diseaseType: string
  weight: number
  distanceKm: number
  reportId: string
  verificationStatus: VerificationStatus
  createdAt: string
}

export interface NearbyResponse {
  farms: Array<{
    farmId: string
    farmName: string
    outbreaks: NearbyOutbreak[]
  }>
}

export interface DiseaseMapStats {
  byDisease: Array<{ diseaseType: string; count: number }>
  byWeek: Array<{ week: string; count: number }>
  highRiskCount: number
}

export interface HeatmapFilters {
  diseaseType?: string
  from?: string
  to?: string
  minWeight?: number
  district?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  conversationId?: string
}

export interface ChatConversation {
  id: string
  title: string
  updatedAt: string
  createdAt: string
}

export interface KnowledgeArticle {
  id: string
  title: string
  source: string
  content: string
  sourceUrl?: string | null
}

export interface RegisterPayload {
  role: UserRole
  name?: string
  username: string
  email?: string
  phone: string
  password: string
  officerId?: string
  assignedRegion?: string
  farms?: Omit<Farm, 'id'>[]
}

export interface LoginPayload {
  username: string
  password: string
}

export interface DiagnosisPayload {
  farmId: string
  category?: 'leaves' | 'stem' | 'bud' | 'fruit'
  imageUrl?: string
  symptoms: Record<string, string | boolean>
  notes?: string
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

export type WeatherIcon = 'sun' | 'partly' | 'rain' | 'cloud'

export interface WeatherDay {
  day: string
  date: string
  high: number
  low: number
  /** @deprecated prefer rainChance — kept for older clients */
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
}
