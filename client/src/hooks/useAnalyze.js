import { useState } from 'react'
import axios from 'axios'

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const useAnalyze = () => {
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const analyze = async (file) => {
    setStatus('loading')
    setError(null)

    try {
      const formData = new FormData()
      formData.append('label', file)

      const res = await axios.post(`${apiBase}/api/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setResult(res.data.data)
      setStatus('success')
    } catch (err) {
      const message = getAnalyzeErrorMessage(err)

      setError(message)
      setStatus('error')
    }
  }

  const reset = () => {
    setStatus('idle')
    setResult(null)
    setError(null)
  }

  return { status, result, error, analyze, reset }
}

const getAnalyzeErrorMessage = (err) => {
  if (err.response?.status === 429) {
    return 'Too many scans right now. Try again in a minute.'
  }

  if (!err.response) {
    return 'Analyzer server is offline. Start it with npm run dev, then retry.'
  }

  if (err.response?.data?.code === 'ANALYZER_NOT_CONFIGURED') {
    return 'Analyzer is not configured yet. Add your Groq API key, then retry.'
  }

  return "Couldn't read this label. Try a clearer photo."
}
