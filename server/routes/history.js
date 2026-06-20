import { Router } from 'express'
import {
  getHistory,
  getDashboardStats,
  getScan,
  deleteScan,
} from '../controllers/historyController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, getHistory)
router.get('/stats', authenticate, getDashboardStats)
router.get('/:id', authenticate, getScan)
router.delete('/:id', authenticate, deleteScan)

export default router
