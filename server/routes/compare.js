import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { compareProducts } from '../controllers/compareController.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

// POST /api/compare
// Expects multipart/form-data with fields: labelA (image), labelB (image)
router.post(
  '/compare',
  optionalAuth,
  upload.fields([
    { name: 'labelA', maxCount: 1 },
    { name: 'labelB', maxCount: 1 },
  ]),
  compareProducts
)

export default router
