import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import * as diseaseMapController from './diseaseMap.controller.js'

const router = Router()

router.get('/api/disease-map/heatmap', requireAuth, diseaseMapController.heatmap)
router.get('/api/disease-map/nearby', requireAuth, diseaseMapController.nearby)
router.get('/api/disease-map/alerts', requireAuth, diseaseMapController.alerts)
router.patch('/api/disease-map/alerts/:id/read', requireAuth, diseaseMapController.markRead)
router.get('/api/disease-map/stats', requireAuth, diseaseMapController.stats)

export default router
