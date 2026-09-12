import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import passport from 'passport'
import { connectDB } from './config/db.js'
import analyzeRouter from './routes/analyze.js'
import authRouter from './routes/auth.js'
import userRouter from './routes/user.js'
import historyRouter from './routes/history.js'
import compareRouter from './routes/compare.js'
import ingredientRouter from './routes/ingredient.js'
import chatRouter from './routes/chat.js'
import billingRouter from './routes/billing.js'
// Side-effect import: registers Passport Google strategy
import './controllers/authController.js'
// Connect MongoDB
connectDB()

const app = express()
app.set('trust proxy', 1)
const port = process.env.PORT || 5000

const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://labellens.app',
  'https://www.labellens.app',
]

const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

const corsOrigins = allowedOrigins.length ? allowedOrigins : defaultOrigins

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (corsOrigins.includes(origin)) return cb(null, true)
      return cb(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)

app.use(
  express.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf
    },
  })
)
app.use(passport.initialize())

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/billing', billingRouter)
app.use('/api', analyzeRouter)
app.use('/api/history', historyRouter)
app.use('/api', compareRouter)
app.use('/api', ingredientRouter)
app.use('/api', chatRouter)

app.get('/health', (_req, res) => res.json({ ok: true, service: 'labellens-v2', timestamp: new Date().toISOString() }))

// 404 Catch-All Handler for unmatched API routes
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'API route not found' })
})

// Central Global Error Handling Middleware
app.use((err, _req, res, _next) => {
  // Multer errors (file size limit, unexpected file format)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File size exceeds 5 MB limit. Please upload a smaller image.' })
    }
    return res.status(400).json({ success: false, error: err.message || 'File upload error' })
  }

  // Body parser malformed JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'Invalid JSON payload in request body.' })
  }

  // CORS rejection
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, error: 'Origin not allowed by CORS policy.' })
  }

  console.error('Unhandled server error:', err)
  const status = err.status || err.statusCode || 500
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'An unexpected internal server error occurred.'
      : err.message || 'Internal server error'

  res.status(status).json({ success: false, error: message })
})

const server = app.listen(port, () => {
  console.log(`🚀 LabelLens v2 server running on port :${port}`)
})

const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`)
  server.close(async () => {
    try {
      const mongoose = (await import('mongoose')).default
      await mongoose.disconnect()
      console.log('MongoDB connection closed.')
    } catch {
      // ignore
    }
    process.exit(0)
  })
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

