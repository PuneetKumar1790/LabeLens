import Groq from 'groq-sdk'

const INGREDIENT_PROMPT = (name) => `You are a food science expert. Provide a clear, accurate explanation of the food ingredient: "${name}".

Return ONLY a valid JSON object — no markdown, no extra text.

{
  "what_it_is": "What this ingredient is — its origin, nature, and common form.",
  "why_used": "Why food manufacturers use it — its functional role (e.g., preservative, emulsifier, sweetener, flavour enhancer).",
  "concerns": "Any known health concerns, controversies, or cautions. State 'None well-established' if no significant concerns.",
  "science_note": "A brief science-backed note on relevant research, studies, or regulatory status (e.g., GRAS status, EU approval, EFSA/FDA stance).",
  "safety_rating": "safe | caution | avoid"
}

safety_rating guidelines:
- "safe": widely accepted as safe at normal dietary levels, well-studied, approved by major food authorities
- "caution": some concerns or evidence of issues at high doses, or limited research, or sensitivities in certain populations
- "avoid": strong evidence of harm, or banned/restricted in major jurisdictions, or linked to serious health issues`

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

export const explainIngredient = async (req, res) => {
  try {
    const rawName = req.body?.name || req.body?.ingredient
    if (!rawName || typeof rawName !== 'string' || rawName.trim().length === 0) {
      return res.status(400).json({ error: 'Ingredient name is required.' })
    }

    const ingredientName = rawName.trim().slice(0, 200) // safety cap

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return res.status(503).json({
        code: 'ANALYZER_NOT_CONFIGURED',
        error: 'Analyzer is not configured yet.',
      })
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const modelName = process.env.GROQ_CHAT_MODEL || 'qwen/qwen3.8-27b'
    const groqPayload = {
      model: modelName,
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: INGREDIENT_PROMPT(ingredientName),
        },
      ],
    }

    if (modelName.toLowerCase().includes('qwen')) {
      groqPayload.reasoning_effort = 'none'
      groqPayload.response_format = { type: 'json_object' }
    }

    const completion = await groq.chat.completions.create(groqPayload)

    const parsed = parseJson(completion.choices[0].message.content)

    // Validate safety_rating
    const validRatings = ['safe', 'caution', 'avoid']
    if (!validRatings.includes(parsed.safety_rating)) {
      parsed.safety_rating = 'caution'
    }

    res.json({ success: true, data: { ingredient: ingredientName, ...parsed } })
  } catch (err) {
    console.error('Ingredient explain error:', err.message)

    if (err?.status === 429) {
      return res.status(429).json({ error: 'Too many requests. Try again in a minute.' })
    }
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'AI returned malformed response. Please try again.' })
    }

    res.status(500).json({ error: err.message || 'Ingredient explanation failed' })
  }
}
