import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import analyzeRouter from './routes/analyze.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())
app.use('/api', analyzeRouter)

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'labellens' })
})

app.listen(port, () => {
  console.log(`LabelLens server running on :${port}`)
})
