import { useState } from 'react'
import api from '../services/api'

export const useAnalyze = () => {
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [isLimitReached, setIsLimitReached] = useState(false)

  const analyze = async (file, userContext = null) => {
    setStatus('loading')
    setError(null)
    setIsLimitReached(false)

    try {
      const guestScans = Number(localStorage.getItem('ll_guest_scans') || 0)
      const formData = new FormData()
      formData.append('label', file)
      if (userContext) {
        formData.append('userContext', JSON.stringify(userContext))
      }

      const res = await api.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-guest-scans': String(guestScans),
        },
      })

      localStorage.setItem('ll_guest_scans', String(guestScans + 1))
      setResult(res.data.data)
      setStatus('success')
    } catch (err) {
      if (err.response?.data?.code === 'SCAN_LIMIT_REACHED') {
        setIsLimitReached(true)
      }
      const message = getAnalyzeErrorMessage(err)

      setError(message)
      setStatus('error')
    }
  }

  const reset = () => {
    setStatus('idle')
    setResult(null)
    setError(null)
    setIsLimitReached(false)
  }

  return { status, result, error, isLimitReached, analyze, reset }
}

const getAnalyzeErrorMessage = (err) => {
  if (err.response?.status === 429) {
    return 'Too many scans right now. Try again in a minute.'
  }

  if (!err.response) {
    return 'Analyzer service is unreachable right now. Please retry in a moment.'
  }

  if (err.response?.data?.code === 'ANALYZER_NOT_CONFIGURED') {
    return 'Analyzer is not configured yet. Add your API key, then retry.'
  }

  if (err.response?.data?.error) {
    return err.response.data.error
  }

  return "Couldn't read this label. Try a clearer photo."
}
