import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { explainIngredient } from '../controllers/ingredientController.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

const ingredientLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // 10 requests per minute per IP
  message: { error: 'Too many ingredient lookups. Try again in a minute.' },
})

// POST /api/ingredient-explain
router.post('/ingredient-explain', optionalAuth, ingredientLimiter, explainIngredient)

export default router
