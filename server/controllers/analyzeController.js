import Groq from 'groq-sdk'
import ScanHistory from '../models/ScanHistory.js'
import { detectAllergens, detectAvoidedIngredients } from '../services/allergyDetector.js'
import { uploadImage } from '../services/blobStorageService.js'

// ---------------------------------------------------------------------------
// Groq prompt — expanded to return ingredients, goal_scores, score_factors,
// red_flags, allergen_suspects while keeping all existing fields.
// ---------------------------------------------------------------------------
const jsonPrompt = `You are a nutrition expert AI. Analyze this food product label image.
Return ONLY valid JSON, no markdown or extra text. Be concise in string values.

If NOT a valid food label: {"is_valid_food_label":false,"reason":"brief explanation"}

If valid, return this exact JSON structure:
{
  "is_valid_food_label":true,
  "product_name":"brand + product name from label",
  "overall_score":<1.0-10.0>,
  "score_label":"Poor|Okay|Good|Excellent",
  "breakdown":{
    "sugar":{"level":"Low|Medium|High","score":<1-10>},
    "protein":{"level":"Low|Medium|High","score":<1-10>},
    "fiber":{"level":"Low|Medium|High","score":<1-10>},
    "additives":{"level":"Low|Medium|High","score":<1-10>},
    "sodium":{"level":"Low|Medium|High","score":<1-10>}
  },
  "positives":["max 2 short strings"],
  "negatives":["max 2 short strings"],
  "verdict":"One short sentence.",
  "recommendation":"One short sentence.",
  "ingredients":["each ingredient from label"],
  "goal_scores":{"weight_loss":<1-10>,"muscle_gain":<1-10>,"general_health":<1-10>,"diabetes_friendly":<1-10>,"heart_health":<1-10>},
  "score_factors":{"positives":[{"label":"short","delta":<+num>}],"negatives":[{"label":"short","delta":<-num>}]},
  "red_flags":[{"level":"red|amber|green","label":"short"}],
  "allergen_suspects":["ingredient strings with common allergens"]
}

Rules: Score sugar/sodium/additives inversely (low amount=high score). Score protein/fiber directly. Base on WHO guidelines. Keep all string values brief to minimize output size.`

// ---------------------------------------------------------------------------
// Helpers — preserved exactly from V1
// ---------------------------------------------------------------------------
const parseJson = (raw) => {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Empty response from AI model')
  }
  let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1)
  }
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

  const ensureArray = (val) => Array.isArray(val) ? val : (typeof val === 'string' && val.trim() ? [val] : [])

  let positives = ensureArray(result.positives)
  let negatives = ensureArray(result.negatives)
  const scoreFactors = result.score_factors || { positives: [], negatives: [] }

  if (positives.length === 0 && Array.isArray(scoreFactors.positives) && scoreFactors.positives.length > 0) {
    positives = scoreFactors.positives.map(x => x?.label).filter(Boolean)
  }
  
  if (negatives.length === 0 && Array.isArray(scoreFactors.negatives) && scoreFactors.negatives.length > 0) {
    negatives = scoreFactors.negatives.map(x => x?.label).filter(Boolean)
  }

  if (positives.length === 0) {
    if (breakdown.protein?.level === 'High') positives.push('Good source of protein')
    if (breakdown.fiber?.level === 'High') positives.push('Good source of fiber')
    if (breakdown.sugar?.level === 'Low') positives.push('Low in sugar')
    if (breakdown.additives?.level === 'Low') positives.push('Low in artificial additives')
    if (breakdown.sodium?.level === 'Low') positives.push('Low in sodium')
  }

  if (negatives.length === 0) {
    if (breakdown.sugar?.level === 'High') negatives.push('High in sugar')
    if (breakdown.sodium?.level === 'High') negatives.push('High in sodium')
    if (breakdown.additives?.level === 'High') negatives.push('High amount of artificial additives')
  }

  return {
    ...result,
    overall_score: overallScore,
    score_label: scoreLabel(overallScore),
    breakdown,
    ...(result.goal_scores ? { goal_scores } : {}),
    positives,
    negatives,
    ingredients: ensureArray(result.ingredients),
    score_factors: scoreFactors,
    red_flags: ensureArray(result.red_flags),
    allergen_suspects: ensureArray(result.allergen_suspects),
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
      vegan: ['meat', 'poultry', 'fish', 'dairy', 'milk', 'cheese', 'butter', 'whey', 'casein', 'ghee', 'curd', 'yogurt', 'egg', 'honey', 'gelatin', 'carmine'],
      jain: ['meat', 'poultry', 'fish', 'egg', 'onion', 'garlic', 'potato', 'carrot', 'turnip', 'radish'],
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

    const modelName = process.env.GROQ_VISION_MODEL || 'qwen/qwen3.8-27b'
    const groqPayload = {
      model: modelName,
      max_tokens: 900,
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
    }

    if (modelName.toLowerCase().includes('qwen')) {
      groqPayload.reasoning_effort = 'none'
      groqPayload.response_format = { type: 'json_object' }
    }

    const completion = await groq.chat.completions.create(groqPayload)

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

    // Optionally upload image to Azure Blob Storage only if user enabled it in settings
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
