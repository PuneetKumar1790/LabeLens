import { Router } from 'express'
import { upload } from '../middleware/upload.js'
import { analyzeLabel } from '../controllers/analyzeController.js'

const router = Router()

router.post('/analyze', upload.single('label'), analyzeLabel)

export default router
