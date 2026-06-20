import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { upload } from '../middleware/upload.js'
import { analyzeLabel } from '../controllers/analyzeController.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 scans per 15 minutes per IP
  message: { error: 'Too many scans right now. Try again in a few minutes.' },
})

// POST /api/analyze
// Accepts multipart/form-data (label file) plus optional JSON fields in body
router.post('/analyze', scanLimiter, optionalAuth, upload.single('label'), analyzeLabel)

export default router
