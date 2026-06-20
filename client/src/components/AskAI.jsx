import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DumbbellIcon, BabyIcon, ScaleIcon, DropIcon } from './Icons'
import api from '../services/api'

const PRESET_QUESTIONS = [
  { id: 'gym', label: 'Is this good for gym?', icon: <DumbbellIcon className="h-4 w-4" /> },
  { id: 'diabetes', label: 'Is this safe for diabetics?', icon: <DropIcon className="h-4 w-4" /> },
  { id: 'children', label: 'Is this suitable for children?', icon: <BabyIcon className="h-4 w-4" /> },
  { id: 'weightloss', label: 'Is this good for weight loss?', icon: <ScaleIcon className="h-4 w-4" /> },
]

export const AskAI = ({ productData }) => {
  const [answer, setAnswer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [error, setError] = useState(null)

  const askQuestion = async (question, id) => {
    setLoading(true)
    setActiveQuestion(id)
    setAnswer(null)
    setError(null)

    try {
      const res = await api.post('/api/chat-about-product', {
        question,
        productData,
      })
      setAnswer(res.data.data?.answer || res.data.answer || res.data.data || 'No response.')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get AI response. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setAnswer(null)
    setActiveQuestion(null)
    setError(null)
  }

  return (
    <div className="mt-8 rounded-xl border border-border bg-surface p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent mb-2">Ask AI</p>
      <p className="font-syne text-sm text-text-2 mb-5">Ask a question about this product.</p>

      {/* Preset buttons */}
      <div className="grid grid-cols-2 gap-2">
        {PRESET_QUESTIONS.map((q) => (
          <motion.button
            key={q.id}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => askQuestion(q.label, q.id)}
            disabled={loading}
            className={`rounded-xl border px-4 py-3 font-syne text-xs text-left transition-all disabled:opacity-50 ${
              activeQuestion === q.id && (loading || answer)
                ? 'border-accent/50 bg-accent/10 text-accent'
                : 'border-border text-text-2 hover:border-text-3 hover:text-text-1'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-text-3 shrink-0">{q.icon}</span>
              <span>{q.label}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-5 flex items-center gap-3"
          >
            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin shrink-0" />
            <p className="font-syne text-sm text-text-2">Analyzing...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
          >
            <p className="font-syne text-sm text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer */}
      <AnimatePresence>
        {answer && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-5"
          >
            <div className="rounded-xl border border-accent/20 bg-accent/5 px-5 py-4">
              <p className="font-syne text-sm leading-6 text-text-1">{answer}</p>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="font-syne text-xs text-text-2 hover:text-text-1 transition-colors"
              >
                Ask another question →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
