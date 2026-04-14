import Groq from 'groq-sdk'

const jsonPrompt = `You are a nutrition expert AI. Carefully examine this food product label image.

Return ONLY a valid JSON object - no markdown, no explanation, no extra text. Use this exact schema:

{
  "product_name": "string - infer from label or packaging design if not explicit",
  "overall_score": <number, 1.0-10.0, one decimal place>,
  "score_label": "Poor | Okay | Good | Excellent",
  "breakdown": {
    "sugar":     { "level": "Low | Medium | High", "score": <1-10> },
    "protein":   { "level": "Low | Medium | High", "score": <1-10> },
    "fiber":     { "level": "Low | Medium | High", "score": <1-10> },
    "additives": { "level": "Low | Medium | High", "score": <1-10> },
    "sodium":    { "level": "Low | Medium | High", "score": <1-10> }
  },
  "positives": ["string", "string"],
  "negatives": ["string", "string"],
  "verdict": "One sentence plain-English health summary of this product.",
  "recommendation": "Brief eat / limit / avoid advice in one sentence."
}

Rules:
- Score additives inversely: more additives = lower score
- Base scoring on WHO nutritional guidelines and standard RDA values
- If image is unclear, still return best estimate with lower confidence scores
- Product name should be the actual brand+product name visible on label`

const parseJson = (raw) => {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
  return JSON.parse(cleaned)
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

    const result = parseJson(completion.choices[0].message.content)
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
