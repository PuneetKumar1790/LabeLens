import Groq from 'groq-sdk'
import { normalizeResult } from './analyzeController.js'
import { upload } from '../middleware/upload.js'

// ---------------------------------------------------------------------------
// Helper: run Groq vision analysis for a single image buffer
// Reuses the same prompt structure as analyzeController for consistency
// ---------------------------------------------------------------------------
const groqPrompt = `You are a nutrition expert AI. Examine this food product label image.
Return ONLY a valid JSON object — no markdown, no explanation, no extra text.

If not a valid food label:
{"is_valid_food_label": false, "reason": "explanation"}

If valid, return:
{
  "is_valid_food_label": true,
  "product_name": "string",
  "overall_score": <1.0-10.0>,
  "score_label": "Poor | Okay | Good | Excellent",
  "breakdown": {
    "sugar":     {"level": "Low|Medium|High", "score": <1-10>},
    "protein":   {"level": "Low|Medium|High", "score": <1-10>},
    "fiber":     {"level": "Low|Medium|High", "score": <1-10>},
    "additives": {"level": "Low|Medium|High", "score": <1-10>},
    "sodium":    {"level": "Low|Medium|High", "score": <1-10>}
  },
  "positives": ["string"],
  "negatives": ["string"],
  "verdict": "One sentence health summary.",
  "recommendation": "One sentence advice.",
  "ingredients": ["string"],
  "goal_scores": {
    "weight_loss": <1-10>,
    "muscle_gain": <1-10>,
    "general_health": <1-10>,
    "diabetes_friendly": <1-10>,
    "heart_health": <1-10>
  },
  "score_factors": {
    "positives": [{"label": "string", "delta": <positive number>}],
    "negatives": [{"label": "string", "delta": <negative number>}]
  },
  "red_flags": [{"level": "red|amber|green", "label": "string"}],
  "allergen_suspects": ["string"]
}

Rules: Score harmful nutrients (sugar, sodium, additives) inversely. Score beneficial (protein, fiber) directly. Base on WHO guidelines.`

const parseJson = (raw) => {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  return JSON.parse(cleaned)
}

const analyzeImageBuffer = async (groq, buffer, mimeType) => {
  const base64 = buffer.toString('base64')
  const completion = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: groqPrompt },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
        ],
      },
    ],
  })
  return parseJson(completion.choices[0].message.content)
}

// ---------------------------------------------------------------------------
// Build comparison object between two normalised results
// ---------------------------------------------------------------------------
const buildComparison = (resultA, resultB) => {
  const goals = ['weight_loss', 'muscle_gain', 'general_health', 'diabetes_friendly', 'heart_health']
  const winners = {}

  for (const goal of goals) {
    const scoreA = resultA.goal_scores?.[goal] ?? resultA.overall_score ?? 5
    const scoreB = resultB.goal_scores?.[goal] ?? resultB.overall_score ?? 5
    winners[goal] = scoreA >= scoreB ? 'A' : 'B'
  }

  // Nutrition table comparison (from breakdown levels)
  const levelToNum = { Low: 1, Medium: 2, High: 3 }
  const table = {}
  for (const nutrient of ['protein', 'sugar', 'fiber', 'sodium', 'additives']) {
    table[nutrient] = {
      a: resultA.breakdown?.[nutrient]?.level || 'Unknown',
      b: resultB.breakdown?.[nutrient]?.level || 'Unknown',
    }
  }

  // Overall winner
  const scoreA = resultA.overall_score || 0
  const scoreB = resultB.overall_score || 0
  let overallWinner = 'tie'
  if (Math.abs(scoreA - scoreB) >= 0.5) {
    overallWinner = scoreA > scoreB ? 'A' : 'B'
  }

  // Summary
  const nameA = resultA.product_name || 'Product A'
  const nameB = resultB.product_name || 'Product B'
  let summary
  if (overallWinner === 'tie') {
    summary = `${nameA} and ${nameB} are closely matched overall (${scoreA} vs ${scoreB}). Choose based on your specific goals.`
  } else {
    const winner = overallWinner === 'A' ? nameA : nameB
    const loser = overallWinner === 'A' ? nameB : nameA
    const winScore = overallWinner === 'A' ? scoreA : scoreB
    const loseScore = overallWinner === 'A' ? scoreB : scoreA
    summary = `${winner} (${winScore}/10) is the healthier choice over ${loser} (${loseScore}/10).`
  }

  return { winners, table, overall_winner: overallWinner, summary }
}

// ---------------------------------------------------------------------------
// compareProducts handler
// POST /api/compare — expects multipart fields: labelA, labelB
// ---------------------------------------------------------------------------
export const compareProducts = async (req, res) => {
  try {
    const fileA = req.files?.labelA?.[0]
    const fileB = req.files?.labelB?.[0]

    if (!fileA || !fileB) {
      return res.status(400).json({ error: 'Both labelA and labelB image files are required.' })
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return res.status(503).json({
        code: 'ANALYZER_NOT_CONFIGURED',
        error: 'Analyzer is not configured yet.',
      })
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    // Run both analyses in parallel
    const [parsedA, parsedB] = await Promise.all([
      analyzeImageBuffer(groq, fileA.buffer, fileA.mimetype),
      analyzeImageBuffer(groq, fileB.buffer, fileB.mimetype),
    ])

    if (parsedA.is_valid_food_label === false) {
      return res.status(400).json({ error: `labelA: ${parsedA.reason || 'Invalid food label'}` })
    }
    if (parsedB.is_valid_food_label === false) {
      return res.status(400).json({ error: `labelB: ${parsedB.reason || 'Invalid food label'}` })
    }

    const resultA = normalizeResult(parsedA)
    const resultB = normalizeResult(parsedB)
    const comparison = buildComparison(resultA, resultB)

    res.json({
      success: true,
      data: {
        productA: resultA,
        productB: resultB,
        comparison,
      },
    })
  } catch (err) {
    console.error('Compare error:', err.message)

    if (err?.status === 429) {
      return res.status(429).json({ error: 'Too many requests. Try again in a minute.' })
    }
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'AI returned malformed response. Please try again.' })
    }

    res.status(500).json({ error: err.message || 'Comparison failed' })
  }
}
