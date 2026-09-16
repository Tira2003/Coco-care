import { apiClient } from './client'
import type {
  User,
  LoginPayload,
  RegisterPayload,
  Farm,
  DiseaseReport,
  HeatmapPoint,
  HeatmapFilters,
  DiseaseAlert,
  NearbyResponse,
  DiseaseMapStats,
  ChatMessage,
  ChatConversation,
  DiagnosisPayload,
  DiagnosisResult,
  WeatherForecast,
  KnowledgeArticle,
  AdminFarm,
  RegionSummary,
  SystemHealth,
  AppNotification,
  NotificationAudience,
  UserRole,
} from '@/types'

export const authApi = {
  login: async (payload: LoginPayload) => {
    const { data } = await apiClient.post<{ token: string; user: User }>(
      '/auth/login',
      payload,
    )
    return data
  },
  register: async (payload: RegisterPayload) => {
    const { data } = await apiClient.post<{ token: string; user: User }>(
      '/auth/register',
      payload,
    )
    return data
  },
  me: async () => {
    const { data } = await apiClient.get<User>('/auth/me')
    return data
  },
  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const { data } = await apiClient.patch<{ ok: boolean }>('/auth/password', payload)
    return data
  },
}

export const farmApi = {
  profile: async () => {
    const { data } = await apiClient.get<{ user: User; farms: Farm[] }>(
      '/farmers/profile',
    )
    return data
  },
  updateProfile: async (payload: { name?: string; email?: string | null; phone?: string | null }) => {
    const { data } = await apiClient.patch<User>('/farmers/profile', payload)
    return data
  },
  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const { data } = await apiClient.patch<{ ok: boolean }>('/farmers/password', payload)
    return data
  },
  create: async (farm: Omit<Farm, 'id'>) => {
    const { data } = await apiClient.post<Farm>('/farms', farm)
    return data
  },
  update: async (id: string, farm: Omit<Farm, 'id'>) => {
    const { data } = await apiClient.patch<Farm>(`/farms/${id}`, farm)
    return data
  },
  delete: async (id: string) => {
    const { data } = await apiClient.delete<{ ok: boolean }>(`/farms/${id}`)
    return data
  },
}

export const diagnosisApi = {
  submit: async (payload: DiagnosisPayload) => {
    const { data } = await apiClient.post<DiagnosisResult>(
      '/api/diagnosis',
      payload,
    )
    return data
  },
}

export const reportsApi = {
  my: async () => {
    const { data } = await apiClient.get<DiseaseReport[]>('/reports/my')
    return data
  },
  pending: async () => {
    const { data } = await apiClient.get<DiseaseReport[]>(
      '/officer/reports/pending',
    )
    return data
  },
  verified: async () => {
    const { data } = await apiClient.get<DiseaseReport[]>(
      '/officer/reports/verified',
    )
    return data
  },
  review: async (
    id: string,
    payload: { action: 'verify' | 'reject'; comment?: string },
  ) => {
    const { data } = await apiClient.post<DiseaseReport>(
      `/officer/reports/${id}/review`,
      payload,
    )
    return data
  },
}

export const diseaseMapApi = {
  heatmap: async (filters?: HeatmapFilters) => {
    const { data } = await apiClient.get<HeatmapPoint[]>(
      '/api/disease-map/heatmap',
      { params: filters },
    )
    return data
  },
  nearby: async (radiusKm?: number) => {
    const { data } = await apiClient.get<NearbyResponse>(
      '/api/disease-map/nearby',
      { params: radiusKm != null ? { radiusKm } : undefined },
    )
    return data
  },
  alerts: async () => {
    const { data } = await apiClient.get<DiseaseAlert[]>('/api/disease-map/alerts')
    return data
  },
  markAlertRead: async (id: string) => {
    const { data } = await apiClient.patch<DiseaseAlert>(
      `/api/disease-map/alerts/${id}/read`,
    )
    return data
  },
  stats: async (filters?: HeatmapFilters) => {
    const { data } = await apiClient.get<DiseaseMapStats>(
      '/api/disease-map/stats',
      { params: filters },
    )
    return data
  },
}

export const chatApi = {
  listConversations: async () => {
    const { data } = await apiClient.get<ChatConversation[]>('/api/chat/conversations')
    return data
  },
  createConversation: async () => {
    const { data } = await apiClient.post<ChatConversation>('/api/chat/conversations')
    return data
  },
  deleteConversation: async (id: string) => {
    await apiClient.delete(`/api/chat/conversations/${id}`)
  },
  getMessages: async (conversationId: string) => {
    const { data } = await apiClient.get<ChatMessage[]>(
      `/api/chat/conversations/${conversationId}/messages`,
    )
    return data
  },
  send: async (conversationId: string, message: string) => {
    const { data } = await apiClient.post<ChatMessage>('/api/chat', {
      conversationId,
      message,
    })
    return data
  },
}

export const adminApi = {
  users: async (params?: { role?: UserRole | ''; q?: string }) => {
    const { data } = await apiClient.get<User[]>('/admin/users', { params })
    return data
  },
  createUser: async (payload: {
    username: string
    password: string
    name: string
    email?: string
    phone?: string
    role: UserRole
    officerId?: string
    assignedRegion?: string
  }) => {
    const { data } = await apiClient.post<User>('/admin/users', payload)
    return data
  },
  updateUser: async (
    id: string,
    payload: {
      name?: string
      email?: string | null
      phone?: string | null
      officerId?: string | null
      assignedRegion?: string | null
    },
  ) => {
    const { data } = await apiClient.patch<User>(`/admin/users/${id}`, payload)
    return data
  },
  resetPassword: async (id: string, password: string) => {
    const { data } = await apiClient.post<{ ok: boolean }>(`/admin/users/${id}/reset-password`, {
      password,
    })
    return data
  },
  getUserPassword: async (id: string) => {
    const { data } = await apiClient.get<{ password: string | null; hasPassword: boolean }>(
      `/admin/users/${id}/password`,
    )
    return data
  },
  deactivateUser: async (id: string) => {
    const { data } = await apiClient.post<User>(`/admin/users/${id}/deactivate`)
    return data
  },
  activateUser: async (id: string) => {
    const { data } = await apiClient.post<User>(`/admin/users/${id}/activate`)
    return data
  },
  deleteUser: async (id: string) => {
    const { data } = await apiClient.delete<{ ok: boolean }>(`/admin/users/${id}`)
    return data
  },
  stats: async () => {
    const { data } = await apiClient.get<{
      totalUsers: number
      pendingReports: number
      verifiedOutbreaks: number
    }>('/admin/stats')
    return data
  },
  reports: async (params?: {
    status?: 'pending' | 'verified' | 'rejected' | ''
    region?: string
    disease?: string
  }) => {
    const { data } = await apiClient.get<DiseaseReport[]>('/admin/reports', { params })
    return data
  },
  reviewReport: async (id: string, payload: { action: 'verify' | 'reject'; comment?: string }) => {
    const { data } = await apiClient.post<DiseaseReport>(`/admin/reports/${id}/review`, payload)
    return data
  },
  farms: async () => {
    const { data } = await apiClient.get<AdminFarm[]>('/admin/farms')
    return data
  },
  farmReports: async (farmId: string) => {
    const { data } = await apiClient.get<DiseaseReport[]>(`/admin/farms/${farmId}/reports`)
    return data
  },
  regionSummary: async () => {
    const { data } = await apiClient.get<RegionSummary[]>('/admin/regions/summary')
    return data
  },
  health: async () => {
    const { data } = await apiClient.get<SystemHealth>('/admin/health')
    return data
  },
  listBroadcasts: async () => {
    const { data } = await apiClient.get<AppNotification[]>('/admin/notifications')
    return data
  },
  createBroadcast: async (payload: {
    title: string
    message: string
    audience: NotificationAudience
  }) => {
    const { data } = await apiClient.post<AppNotification>('/admin/notifications', payload)
    return data
  },
}

export const notificationsApi = {
  list: async () => {
    const { data } = await apiClient.get<AppNotification[]>('/api/notifications')
    return data
  },
  markRead: async (id: string) => {
    const { data } = await apiClient.post<{ ok: boolean }>(`/api/notifications/${id}/read`)
    return data
  },
}

export const weatherApi = {
  forecast: async (params: { lat?: number; lon?: number; location?: string }) => {
    const { data } = await apiClient.get<WeatherForecast>('/api/weather/forecast', {
      params,
    })
    return data
  },
}

export const knowledgeApi = {
  getByTitle: async (title: string) => {
    const { data } = await apiClient.get<KnowledgeArticle>('/api/knowledge/documents', {
      params: { title },
    })
    return data
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get<KnowledgeArticle>(`/api/knowledge/documents/${id}`)
    return data
  },
}
