import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { upload } from '../middleware/upload.js'
import { analyzeLabel } from '../controllers/analyzeController.js'

const router = Router()

const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 scans per 15 minutes
  message: { error: 'Too many scans right now. Try again in a few minutes.' }
})

router.post('/analyze', scanLimiter, upload.single('label'), analyzeLabel)

export default router
