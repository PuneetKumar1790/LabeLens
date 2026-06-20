import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { chatAboutProduct } from '../controllers/chatController.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,             // 15 requests per minute per IP
  message: { error: 'Too many chat requests. Try again in a minute.' },
})

// POST /api/chat-about-product
router.post('/chat-about-product', optionalAuth, chatLimiter, chatAboutProduct)

export default router
