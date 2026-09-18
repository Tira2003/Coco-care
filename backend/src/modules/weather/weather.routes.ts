import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import * as weatherController from './weather.controller.js'

const router = Router()

router.get('/api/weather/forecast', requireAuth, weatherController.forecast)

export default router
