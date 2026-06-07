import Groq from 'groq-sdk'

const jsonPrompt = `You are a nutrition expert AI. Carefully examine this image to determine if it is a valid food product label.

First, perform validation:
1. Does the image contain a food product label?
2. Are there visible food-related indicators (ingredients list, nutrition facts, serving size, calories, fat, sugar, protein, sodium, additives, etc.)?

Return ONLY a valid JSON object - no markdown, no explanation, no extra text.

If the image IS NOT a valid food label, or if confidence is low, return EXACTLY this JSON format:
{
  "is_valid_food_label": false,
  "reason": "Brief explanation of why it is rejected (e.g., 'Image is a resume, not a food label', 'No nutrition facts or ingredients visible', 'Too blurry to read')."
}

If the image IS a valid food label, return the full analysis using this EXACT JSON format:
{
  "is_valid_food_label": true,
  "product_name": "string - infer from label or packaging design if not explicit",
  "overall_score": <number, 1.0-10.0, one decimal place>,
  "score_label": "Poor | Okay | Good | Excellent",
  "breakdown": {
    "sugar":     { "level": "Low | Medium | High", "score": <health score 1-10> },
    "protein":   { "level": "Low | Medium | High", "score": <health score 1-10> },
    "fiber":     { "level": "Low | Medium | High", "score": <health score 1-10> },
    "additives": { "level": "Low | Medium | High", "score": <health score 1-10> },
    "sodium":    { "level": "Low | Medium | High", "score": <health score 1-10> }
  },
  "positives": ["string", "string"],
  "negatives": ["string", "string"],
  "verdict": "One sentence plain-English health summary of this product.",
  "recommendation": "Brief eat / limit / avoid advice in one sentence."
}

Rules for analysis (only if valid):
- Breakdown "level" means the detected amount in the product.
- Breakdown "score" is always a health score where 10 is best and 1 is worst.
- Score sugar, sodium, and additives inversely: low amount = high score, high amount = low score.
- Score protein and fiber directly: high amount = high score, low amount = low score.
- Base scoring on WHO nutritional guidelines and standard RDA values
- Product name should be the actual brand+product name visible on label`

const parseJson = (raw) => {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
  return JSON.parse(cleaned)
}

const harmfulKeys = new Set(['sugar', 'additives', 'sodium'])
const beneficialKeys = new Set(['protein', 'fiber'])
const levelScores = {
  harmful: { Low: 8, Medium: 5, High: 2 },
  beneficial: { Low: 2, Medium: 5, High: 8 },
}

const clampScore = (score) => Math.min(10, Math.max(1, Number(score) || 5))

const scoreLabel = (score) => {
  if (score <= 3.9) return 'Poor'
  if (score <= 6.4) return 'Okay'
  if (score <= 7.9) return 'Good'
  return 'Excellent'
}

const normalizeLevel = (level) => {
  const value = String(level || 'Medium').trim().toLowerCase()
  if (value === 'low') return 'Low'
  if (value === 'high') return 'High'
  return 'Medium'
}

const normalizeBreakdownItem = (key, item = {}) => {
  const level = normalizeLevel(item.level)
  const kind = beneficialKeys.has(key) ? 'beneficial' : 'harmful'
  const fallbackScore = levelScores[kind][level]
  let score = clampScore(item.score ?? fallbackScore)

  if (harmfulKeys.has(key)) {
    if (level === 'Low') score = Math.max(score, 7)
    if (level === 'High') score = Math.min(score, 4)
  }

  if (beneficialKeys.has(key)) {
    if (level === 'Low') score = Math.min(score, 4)
    if (level === 'High') score = Math.max(score, 7)
  }

  return {
    level,
    score: Number(score.toFixed(1)),
  }
}

export const normalizeResult = (result) => {
  const keys = ['sugar', 'protein', 'fiber', 'additives', 'sodium']
  const breakdown = {}
  const overallScore = Number(clampScore(result.overall_score).toFixed(1))

  for (const key of keys) {
    breakdown[key] = normalizeBreakdownItem(key, result.breakdown?.[key])
  }

  return {
    ...result,
    overall_score: overallScore,
    score_label: scoreLabel(overallScore),
    breakdown,
  }
}

export const analyzeLabel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' })
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return res.status(503).json({
        code: 'ANALYZER_NOT_CONFIGURED',
        error: 'Analyzer is not configured yet.',
      })
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const base64Image = req.file.buffer.toString('base64')
    const mimeType = req.file.mimetype

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: jsonPrompt },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
          ],
        },
      ],
    })

    const parsed = parseJson(completion.choices[0].message.content)
    
    if (parsed.is_valid_food_label === false) {
      return res.status(400).json({ error: parsed.reason || 'Invalid food label detected.' })
    }

    const result = normalizeResult(parsed)
    res.json({ success: true, data: result })
  } catch (err) {
    console.error('Analysis error:', err.message)

    if (err?.status === 429) {
      return res.status(429).json({ error: 'Too many scans right now. Try again in a minute.' })
    }

    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'AI returned malformed response. Please try again.' })
    }

    res.status(500).json({ error: err.message || 'Analysis failed' })
  }
}
