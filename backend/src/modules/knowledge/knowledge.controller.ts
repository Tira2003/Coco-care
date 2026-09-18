import type { Request, Response } from 'express'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { notFound, unauthorized } from '../../utils/errors.js'
import { findDocumentById, findDocumentByTitle } from './knowledge.repository.js'

export const documents = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw unauthorized()
  const title = typeof req.query.title === 'string' ? req.query.title.trim() : ''
  if (!title) throw notFound('Document not found')
  const article = await findDocumentByTitle(title)
  if (!article) throw notFound('Document not found')
  res.json(article)
})

export const documentById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw unauthorized()
  const article = await findDocumentById(String(req.params.id))
  if (!article) throw notFound('Document not found')
  res.json(article)
})
