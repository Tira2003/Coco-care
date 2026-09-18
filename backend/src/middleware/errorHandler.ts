import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const first = err.issues[0]
    res.status(400).json({ message: first?.message ?? 'Invalid input' })
    return
  }

  const error = err as { status?: number; message?: string; code?: string }
  if (error.code === '23505') {
    res.status(409).json({ message: 'An account with these details already exists' })
    return
  }

  const status = error.status ?? 500
  if (status >= 500) {
    console.error(err)
  }

  res.status(status).json({
    message: status >= 500 ? 'Internal server error' : (error.message ?? 'Request failed'),
  })
}
