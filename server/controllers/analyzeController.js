import Groq from 'groq-sdk'
import ScanHistory from '../models/ScanHistory.js'
import { detectAllergens, detectAvoidedIngredients } from '../services/allergyDetector.js'
import { uploadImage } from '../services/blobStorageService.js'

// ---------------------------------------------------------------------------
// Groq prompt — expanded to return ingredients, goal_scores, score_factors,
// red_flags, allergen_suspects while keeping all existing fields.
// ---------------------------------------------------------------------------
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
  "recommendation": "Brief eat / limit / avoid advice in one sentence.",
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
  "red_flags": [{"level": "red | amber | green", "label": "string"}],
  "allergen_suspects": ["string"]
}

Rules for analysis (only if valid):
- Breakdown "level" means the detected amount in the product.
- Breakdown "score" is always a health score where 10 is best and 1 is worst.
- Score sugar, sodium, and additives inversely: low amount = high score, high amount = low score.
- Score protein and fiber directly: high amount = high score, low amount = low score.
- Base scoring on WHO nutritional guidelines and standard RDA values.
- Product name should be the actual brand+product name visible on label.
- ingredients: extract every ingredient listed on the label as individual strings.
- goal_scores: rate how well this product suits each health goal on a 1-10 scale.
- score_factors.positives: list of positive factors with how much each boosts the score (delta > 0).
- score_factors.negatives: list of negative factors with how much each hurts the score (delta < 0).
- red_flags: notable concerns or positives — level red = serious concern, amber = caution, green = positive.
- allergen_suspects: ingredient strings that may contain common allergens (even if not explicitly labelled).`

// ---------------------------------------------------------------------------
// Helpers — preserved exactly from V1
// ---------------------------------------------------------------------------
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

  // Normalise goal_scores if present
  const goalScoreKeys = ['weight_loss', 'muscle_gain', 'general_health', 'diabetes_friendly', 'heart_health']
  const goal_scores = {}
  if (result.goal_scores) {
    for (const k of goalScoreKeys) {
      goal_scores[k] = Number(clampScore(result.goal_scores?.[k] ?? 5).toFixed(1))
    }
  }

  return {
    ...result,
    overall_score: overallScore,
    score_label: scoreLabel(overallScore),
    breakdown,
    ...(result.goal_scores ? { goal_scores } : {}),
    ingredients: Array.isArray(result.ingredients) ? result.ingredients : [],
    score_factors: result.score_factors || { positives: [], negatives: [] },
    red_flags: Array.isArray(result.red_flags) ? result.red_flags : [],
    allergen_suspects: Array.isArray(result.allergen_suspects) ? result.allergen_suspects : [],
  }
}

// ---------------------------------------------------------------------------
// Build "for_you" personalisation block
// ---------------------------------------------------------------------------
const buildForYou = (result, userContext, allergyAlerts, avoidedWarnings) => {
  const goals = userContext?.goals || []
  const dietaryPreferences = userContext?.dietaryPreferences || []

  // Goal match — average goal_scores for user's selected goals
  let goalMatch = 'fair'
  if (goals.length > 0 && result.goal_scores) {
    const relevant = goals.map((g) => result.goal_scores[g] || 5)
    const avg = relevant.reduce((a, b) => a + b, 0) / relevant.length
    if (avg >= 8) goalMatch = 'excellent'
    else if (avg >= 6) goalMatch = 'good'
    else if (avg >= 4) goalMatch = 'fair'
    else goalMatch = 'poor'
  } else {
    const overallScore = result.overall_score || 5
    if (overallScore >= 8) goalMatch = 'excellent'
    else if (overallScore >= 6) goalMatch = 'good'
    else if (overallScore >= 4) goalMatch = 'fair'
    else goalMatch = 'poor'
  }

  // Allergy status
  const redAlerts = (allergyAlerts || []).filter((a) => a.level === 'red')
  const amberAlerts = (allergyAlerts || []).filter((a) => a.level === 'amber')
  let allergyStatus = 'safe'
  if (redAlerts.length > 0) allergyStatus = 'danger'
  else if (amberAlerts.length > 0 || (avoidedWarnings || []).length > 0) allergyStatus = 'warning'

  // Dietary match — naive check: look for preference keywords in product positives/verdict
  let dietaryMatch = true
  if (dietaryPreferences.length > 0) {
    const productText = [
      ...(result.positives || []),
      result.verdict || '',
      result.recommendation || '',
    ].join(' ').toLowerCase()

    const dietaryKeywords = {
      vegetarian: ['meat', 'chicken', 'beef', 'pork', 'lamb', 'fish', 'seafood', 'gelatin'],
      vegan: ['meat', 'chicken', 'beef', 'pork', 'lamb', 'fish', 'dairy', 'milk', 'egg', 'honey', 'gelatin'],
      halal: ['pork', 'lard', 'alcohol', 'wine', 'beer'],
      kosher: ['pork', 'shellfish'],
      gluten_free: ['wheat', 'gluten', 'barley', 'rye', 'oat'],
      low_carb: ['high sugar', 'high carb', 'maltose', 'corn syrup'],
      keto: ['high sugar', 'high carb', 'corn syrup'],
    }

    for (const pref of dietaryPreferences) {
      const badWords = dietaryKeywords[pref.toLowerCase()] || []
      const ingredientStr = (result.ingredients || []).join(' ').toLowerCase()
      for (const word of badWords) {
        if (ingredientStr.includes(word) || productText.includes(word)) {
          dietaryMatch = false
          break
        }
      }
      if (!dietaryMatch) break
    }
  }

  // Final recommendation
  let finalRecommendation = result.recommendation || ''
  if (allergyStatus === 'danger') {
    finalRecommendation = `⚠️ AVOID — allergen detected. ${finalRecommendation}`
  } else if (allergyStatus === 'warning') {
    finalRecommendation = `⚠️ Caution — contains ingredients you typically avoid. ${finalRecommendation}`
  } else if (!dietaryMatch) {
    finalRecommendation = `⚠️ May not suit your dietary preferences. ${finalRecommendation}`
  }

  return {
    goal_match: goalMatch,
    allergy_status: allergyStatus,
    dietary_match: dietaryMatch,
    final_recommendation: finalRecommendation,
  }
}

// ---------------------------------------------------------------------------
// Main analyzeLabel handler
// ---------------------------------------------------------------------------
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

    // Parse optional userContext from multipart or JSON body
    let userContext = null
    if (req.body?.userContext) {
      try {
        userContext = typeof req.body.userContext === 'string'
          ? JSON.parse(req.body.userContext)
          : req.body.userContext
      } catch {
        userContext = null
      }
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const base64Image = req.file.buffer.toString('base64')
    const mimeType = req.file.mimetype

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      response_format: { type: 'json_object' },
      max_tokens: 2000,
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

    // Run allergy detection if userContext provided
    let allergyAlerts = []
    let avoidedWarnings = []

    if (userContext) {
      const ingredientList = result.ingredients || []

      if (userContext.allergies && ingredientList.length > 0) {
        const { alerts } = detectAllergens(ingredientList, userContext.allergies)
        allergyAlerts = alerts
      }

      if (userContext.avoided && ingredientList.length > 0) {
        const { warnings } = detectAvoidedIngredients(ingredientList, userContext.avoided)
        avoidedWarnings = warnings
      }

      result.allergy_alerts = allergyAlerts
      result.avoided_warnings = avoidedWarnings
    }

    // Build for_you personalisation block
    const forYou = buildForYou(result, userContext, allergyAlerts, avoidedWarnings)
    result.for_you = forYou

    // Optionally upload image to Azure Blob Storage
    let imageUrl = null
    if (
      req.user?.saveImages &&
      process.env.AZURE_STORAGE_CONNECTION_STRING &&
      process.env.AZURE_STORAGE_CONNECTION_STRING.trim() !== ''
    ) {
      try {
        imageUrl = await uploadImage(req.user._id.toString(), req.file.buffer, mimeType)
      } catch (blobErr) {
        console.error('Blob upload failed (non-fatal):', blobErr.message)
      }
    }

    // Save scan to ScanHistory if user is authenticated
    if (req.user) {
      try {
        await ScanHistory.create({
          userId: req.user._id,
          productName: result.product_name || 'Unknown Product',
          healthScore: result.overall_score,
          goalScores: result.goal_scores || {},
          recommendation: result.recommendation || '',
          nutritionData: result.breakdown || {},
          ingredientList: result.ingredients || [],
          allergyAlerts: allergyAlerts,
          redFlags: result.red_flags || [],
          imageUrl,
          forYou,
        })
      } catch (dbErr) {
        console.error('ScanHistory save failed (non-fatal):', dbErr.message)
      }
    }

    res.json({ success: true, data: result })
  } catch (err) {
    console.error('Analysis error:', err.message)

    if (err?.status === 429) {
      return res.status(429).json({ error: 'Too many scans right now. Try again in a minute.' })
    }

    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'AI returned malformed response. Please try again.' })
    }
    
    if (err.message && err.message.includes('model_decommissioned')) {
      return res.status(503).json({ error: 'The AI model is temporarily unavailable or decommissioned. Please try again later.' })
    }

    // Hide raw JSON strings that might come from Groq API errors
    const safeError = err.message.startsWith('{') || err.message.includes('{"error"')
      ? 'The AI analysis service is temporarily unavailable. Please try again later.'
      : err.message

    res.status(500).json({ error: safeError || 'Analysis failed' })
  }
}
