import Groq from 'groq-sdk'
import ChatHistory from '../models/ChatHistory.js'
import mongoose from 'mongoose'

/**
 * POST /api/chat-about-product
 * Body: { question: string, productData: object, scanId?: string }
 */
export const chatAboutProduct = async (req, res) => {
  try {
    const { question, productData, scanId } = req.body

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'question is required.' })
    }
    if (!productData || typeof productData !== 'object') {
      return res.status(400).json({ error: 'productData is required and must be an object.' })
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return res.status(503).json({
        code: 'ANALYZER_NOT_CONFIGURED',
        error: 'Analyzer is not configured yet.',
      })
    }

    const trimmedQuestion = question.trim().slice(0, 1000) // safety cap
    const productJson = JSON.stringify(productData).slice(0, 8000) // safety cap

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const systemPrompt = `You are a nutrition expert. Given this product analysis: ${productJson}. Answer the user's specific question about this product in 2-4 sentences. Be direct, helpful, and evidence-based. Do not add generic disclaimers.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 400,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: trimmedQuestion },
      ],
    })

    const answer = completion.choices[0].message.content?.trim() || ''

    // Save to ChatHistory (non-fatal)
    try {
      const userId = req.user?._id || null
      const scanIdObj =
        scanId && mongoose.isValidObjectId(scanId)
          ? new mongoose.Types.ObjectId(scanId)
          : null

      // Find existing conversation for this user+scan or create new
      const chatDoc = await ChatHistory.findOneAndUpdate(
        { userId, scanId: scanIdObj },
        {
          $push: {
            messages: {
              $each: [
                { role: 'user', content: trimmedQuestion, ts: new Date() },
                { role: 'assistant', content: answer, ts: new Date() },
              ],
            },
          },
        },
        { upsert: true, new: true }
      )
    } catch (dbErr) {
      console.error('ChatHistory save failed (non-fatal):', dbErr.message)
    }

    res.json({ success: true, data: { answer } })
  } catch (err) {
    console.error('Chat error:', err.message)

    if (err?.status === 429) {
      return res.status(429).json({ error: 'Too many requests. Try again in a minute.' })
    }

    res.status(500).json({ error: err.message || 'Chat failed' })
  }
}
