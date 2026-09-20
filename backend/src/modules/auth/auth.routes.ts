import { Router } from 'express'
import { requireAuth } from '../../middleware/auth.js'
import * as authController from './auth.controller.js'

const router = Router()

router.post('/login', authController.login)
router.post('/register', authController.register)
router.get('/me', requireAuth, authController.me)
router.patch('/password', requireAuth, authController.changePassword)
router.patch('/profile', requireAuth, authController.updateProfile)

export default router
