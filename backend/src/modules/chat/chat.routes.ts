import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import * as chatController from './chat.controller.js'

const router = Router()

router.get('/api/chat/conversations', requireAuth, chatController.list)
router.post('/api/chat/conversations', requireAuth, chatController.create)
router.delete('/api/chat/conversations/:id', requireAuth, chatController.remove)
router.get('/api/chat/conversations/:id/messages', requireAuth, chatController.messages)
router.post('/api/chat', requireAuth, chatController.send)

export default router
