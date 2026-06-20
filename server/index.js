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
// Side-effect import: registers Passport Google strategy
import './controllers/authController.js'
// Connect MongoDB
connectDB()

const app = express()
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

app.use(express.json({ limit: '10mb' }))
app.use(passport.initialize())

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api', analyzeRouter)
app.use('/api/history', historyRouter)
app.use('/api', compareRouter)
app.use('/api', ingredientRouter)
app.use('/api', chatRouter)

app.get('/health', (_req, res) => res.json({ ok: true, service: 'labellens-v2' }))

app.listen(port, () => console.log(`LabelLens v2 server running on :${port}`))
