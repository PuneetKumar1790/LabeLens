import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import analyzeRouter from './routes/analyze.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

const defaultOrigins = [
  'http://localhost:5173',
  'https://labellens.app',
  'https://www.labellens.app',
]

const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const corsOrigins = allowedOrigins.length ? allowedOrigins : defaultOrigins

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests and non-browser clients without Origin header.
      if (!origin) return callback(null, true)
      if (corsOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
  })
)
app.use(express.json())
app.use('/api', analyzeRouter)

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'labellens' })
})

app.listen(port, () => {
  console.log(`LabelLens server running on :${port}`)
})
