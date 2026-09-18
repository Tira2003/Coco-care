import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import * as diagnosisController from './diagnosis.controller.js'

const router = Router()

router.post('/api/diagnosis', requireAuth, diagnosisController.create)

export default router
