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
