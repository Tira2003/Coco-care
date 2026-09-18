import type { NextFunction, Request, Response } from 'express'
import { unauthorized } from '../utils/errors.js'
import { verifyToken } from '../utils/jwt.js'
import { findAccountById } from '../modules/auth/auth.repository.js'
import { toPublicUser } from '../modules/auth/auth.service.js'
import type { User } from '../types/index.js'

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      throw unauthorized('Missing or invalid authorization header')
    }

    const token = header.slice('Bearer '.length).trim()
    if (!token) {
      throw unauthorized('Missing or invalid authorization header')
    }

    let payload
    try {
      payload = verifyToken(token)
    } catch {
      throw unauthorized('Invalid or expired token')
    }

    const account = await findAccountById(payload.sub, payload.role)
    if (!account || !account.isActive) {
      throw unauthorized('Invalid or expired token')
    }

    req.user = toPublicUser(account)
    next()
  } catch (err) {
    next(err)
  }
}
