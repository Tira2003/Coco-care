import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import * as notificationsController from './notifications.controller.js'

const router = Router()

router.get('/api/notifications', requireAuth, notificationsController.listMine)
router.post('/api/notifications/read-all', requireAuth, notificationsController.markAllRead)
router.post('/api/notifications/read', requireAuth, notificationsController.markRead)
router.post('/api/notifications/dismiss', requireAuth, notificationsController.dismiss)
router.post('/api/notifications/:id/dismiss', requireAuth, notificationsController.dismiss)
router.post('/api/notifications/:id/read', requireAuth, notificationsController.markRead)

router.get('/admin/notifications', requireAuth, notificationsController.adminList)
router.post('/admin/notifications', requireAuth, notificationsController.adminCreate)

export default router
