import jwt, { type SignOptions } from 'jsonwebtoken'
import type { UserRole } from '../types/index.js'
import { env } from '../config/env.js'

export interface JwtPayload {
  sub: string
  role: UserRole
}

export function signToken(userId: string, role: UserRole): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] }
  return jwt.sign({ sub: userId, role } satisfies JwtPayload, env.jwtSecret, options)
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload
}
