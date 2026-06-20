import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

const SAFETY_STYLES = {
  safe: 'border-green-500/40 bg-green-500/10 text-green-400',
  moderate: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  caution: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
  unsafe: 'border-red-500/40 bg-red-500/10 text-red-400',
}

const SlideOver = ({ ingredient, onClose }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useState(() => {
    const fetchExplain = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.post('/api/ingredient-explain', { ingredient })
        setData(res.data.data || res.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load ingredient info.')
      } finally {
        setLoading(false)
      }
    }
    fetchExplain()
  }, [ingredient])

  const safetyStyle = data?.safety_rating
    ? SAFETY_STYLES[String(data.safety_rating).toLowerCase()] || SAFETY_STYLES.moderate
    : SAFETY_STYLES.moderate

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg/70 backdrop-blur-sm" />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-border bg-surface shadow-2xl"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <h2 className="font-syne text-lg font-bold text-text-1">{ingredient}</h2>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg border border-border px-3 py-1.5 font-syne text-xs text-text-2 hover:text-text-1 transition-colors"
            >
              Close ×
            </button>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
              <p className="font-syne text-sm text-text-2">Looking up ingredient...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
              <p className="font-syne text-sm text-red-400">{error}</p>
            </div>
          )}

          {data && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Safety rating */}
              {data.safety_rating && (
                <span className={`inline-flex rounded-full border px-4 py-1.5 font-syne text-xs font-bold ${safetyStyle}`}>
                  Safety: {data.safety_rating}
                </span>
              )}

              {/* What it is */}
              {data.what_it_is && (
                <div>
                  <p className="font-syne text-xs text-text-3 uppercase tracking-wider mb-2">What it is</p>
                  <p className="font-syne text-sm leading-6 text-text-2">{data.what_it_is}</p>
                </div>
              )}

              {/* Why used */}
              {data.why_used && (
                <div>
                  <p className="font-syne text-xs text-text-3 uppercase tracking-wider mb-2">Why it's used</p>
                  <p className="font-syne text-sm leading-6 text-text-2">{data.why_used}</p>
                </div>
              )}

              {/* Concerns */}
              {data.concerns && (
                <div>
                  <p className="font-syne text-xs text-text-3 uppercase tracking-wider mb-2">Concerns</p>
                  <p className="font-syne text-sm leading-6 text-text-2">{data.concerns}</p>
                </div>
              )}

              {/* Science note */}
              {data.science_note && (
                <div className="rounded-xl border border-border bg-bg p-4">
                  <p className="font-syne text-xs text-text-3 uppercase tracking-wider mb-2">Science note</p>
                  <p className="font-syne text-xs leading-5 text-text-2 italic">{data.science_note}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export const IngredientList = ({ ingredients = [] }) => {
  const [selected, setSelected] = useState(null)

  if (!ingredients || ingredients.length === 0) return null

  return (
    <div className="mt-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent mb-4">Ingredients</p>
      <p className="font-syne text-xs text-text-3 mb-3">Tap any ingredient to learn more</p>
      <div className="flex flex-wrap gap-2">
        {ingredients.map((ingredient, i) => {
          const name = typeof ingredient === 'string' ? ingredient : ingredient.name || ingredient.label || String(ingredient)
          return (
            <motion.button
              key={`${name}-${i}`}
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(name)}
              className="rounded-full border border-border bg-surface px-3 py-1.5 font-syne text-xs text-text-2 hover:border-accent/50 hover:text-text-1 transition-all"
            >
              {name}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <SlideOver ingredient={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
