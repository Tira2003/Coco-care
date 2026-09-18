import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { unauthorized } from '../../utils/errors.js'
import { changePasswordSchema, loginSchema, registerSchema } from './auth.schemas.js'
import * as authService from './auth.service.js'

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body)
  const result = await authService.login(input)
  res.json(result)
})

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body)
  const result = await authService.register(input)
  res.status(201).json(result)
})

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw unauthorized()
  const user = await authService.getMe(req.user.id, req.user.role)
  res.json(user)
})

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw unauthorized()
  const input = changePasswordSchema.parse(req.body)
  const result = await authService.changePassword(req.user.id, req.user.role, input)
  res.json(result)
})
