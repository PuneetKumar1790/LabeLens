import { Router } from 'express'
import {
  getProfile,
  updatePreferences,
  updateAllergyProfile,
  updateAvoidedIngredients,
  updateSettings,
} from '../controllers/userController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/profile', authenticate, getProfile)
router.put('/preferences', authenticate, updatePreferences)
router.put('/allergies', authenticate, updateAllergyProfile)
router.put('/avoided', authenticate, updateAvoidedIngredients)
router.put('/settings', authenticate, updateSettings)

export default router
