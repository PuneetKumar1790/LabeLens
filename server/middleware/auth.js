import { verifyToken } from '../services/jwtService.js'
import User from '../models/User.js'

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    const payload = verifyToken(token)
    const user = await User.findById(payload.sub).lean()
    if (!user) return res.status(401).json({ error: 'User not found' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (token) {
      const payload = verifyToken(token)
      const user = await User.findById(payload.sub).lean()
      req.user = user || null
    } else {
      req.user = null
    }
  } catch {
    req.user = null
  }
  next()
}
