import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { upload } from '../middleware/upload.js'
import { compareProducts } from '../controllers/compareController.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

const compareLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,                  // 15 comparisons per 15 minutes per IP
  message: { error: 'Too many comparison requests right now. Try again in a few minutes.' },
})

// POST /api/compare
// Expects multipart/form-data with fields: labelA (image), labelB (image)
router.post(
  '/compare',
  compareLimiter,
  optionalAuth,
  upload.fields([
    { name: 'labelA', maxCount: 1 },
    { name: 'labelB', maxCount: 1 },
  ]),
  compareProducts
)

export default router
