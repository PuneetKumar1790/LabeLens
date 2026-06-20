import { Router } from 'express'
import { googleAuth, googleCallback, getMe, logout } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/google', googleAuth)
router.get('/google/callback', googleCallback)
router.get('/me', authenticate, getMe)
router.post('/logout', authenticate, logout)

export default router
