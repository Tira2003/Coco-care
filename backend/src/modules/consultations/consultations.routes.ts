import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import * as consultationsController from './consultations.controller.js'

const router = Router()

router.get('/api/consultations', requireAuth, consultationsController.listMine)
router.post('/api/consultations', requireAuth, consultationsController.createMine)
router.get('/api/consultations/:id', requireAuth, consultationsController.getMine)
router.post('/api/consultations/:id/messages', requireAuth, consultationsController.replyMine)
router.post('/api/consultations/:id/resolve', requireAuth, consultationsController.resolveMine)

router.get('/api/officer/consultations', requireAuth, consultationsController.listInbox)
router.get('/api/officer/consultations/:id', requireAuth, consultationsController.getInbox)
router.post(
  '/api/officer/consultations/:id/messages',
  requireAuth,
  consultationsController.replyInbox,
)
router.post(
  '/api/officer/consultations/:id/resolve',
  requireAuth,
  consultationsController.resolveInbox,
)

export default router
