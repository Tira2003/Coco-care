import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import * as knowledgeController from './knowledge.controller.js'

const router = Router()

router.get('/api/knowledge/documents', requireAuth, knowledgeController.documents)
router.get('/api/knowledge/documents/:id', requireAuth, knowledgeController.documentById)

export default router
