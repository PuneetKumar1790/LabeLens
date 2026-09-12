import { Router } from 'express'
import { handleWebhook, getBillingStatus } from '../controllers/billingController.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

// Public webhook listener for Lemon Squeezy events
router.post('/webhook', handleWebhook)

// Check current user subscription and scan balance
router.get('/status', optionalAuth, getBillingStatus)

export default router
