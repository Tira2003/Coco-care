import { z } from 'zod'

export const userRoleSchema = z.enum(['farmer', 'officer', 'admin'])

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Please enter your NIC number'),
  password: z.string().min(1, 'Please enter your password'),
})

const farmInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  location: z.string().trim().min(1).max(100),
  latitude: z.number().finite().optional(),
  longitude: z.number().finite().optional(),
  acreage: z.number().finite().nonnegative().optional(),
  treeCount: z.number().int().nonnegative().optional(),
})

export const registerSchema = z.object({
  role: userRoleSchema.default('farmer'),
  username: z.string().trim().min(3, 'Username is too short').max(50),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().trim().min(3, 'Please enter your full name').max(100),
  email: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().email('That email does not look right').optional(),
  ),
  phone: z.string().trim().min(9, 'Enter a valid mobile number').max(20),
  officerId: z.string().trim().max(50).optional(),
  assignedRegion: z.string().trim().max(100).optional(),
  farms: z.array(farmInputSchema).optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type FarmInput = z.infer<typeof farmInputSchema>
