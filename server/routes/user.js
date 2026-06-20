import { Router } from 'express'
import {
  getProfile,
  updatePreferences,
  updateAllergyProfile,
  updateAvoidedIngredients,
  updateSettings,
  deleteAccount,
} from '../controllers/userController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/profile', authenticate, getProfile)
router.put('/preferences', authenticate, updatePreferences)
router.put('/allergies', authenticate, updateAllergyProfile)
router.put('/avoided', authenticate, updateAvoidedIngredients)
router.put('/settings', authenticate, updateSettings)
router.delete('/account', authenticate, deleteAccount)

export default router
