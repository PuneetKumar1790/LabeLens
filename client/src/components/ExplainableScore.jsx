import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ChipFactor = ({ label, value, isPositive }) => (
  <motion.span
    initial={{ opacity: 0, scale: 0.88 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-syne text-xs font-semibold ${
      isPositive
        ? 'border-green-500/30 bg-green-500/10 text-green-400'
        : 'border-red-500/30 bg-red-500/10 text-red-400'
    }`}
  >
    {isPositive ? `+${value}` : `-${Math.abs(value)}`} {label}
  </motion.span>
)

export const ExplainableScore = ({ score, factors }) => {
  const [open, setOpen] = useState(false)

  if (!factors) return null

  const positives = factors.positives || factors.positive || []
  const negatives = factors.negatives || factors.negative || []

  if (positives.length === 0 && negatives.length === 0) return null

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 font-syne text-xs text-text-2 hover:text-text-1 transition-colors"
      >
        <span>{open ? 'Hide breakdown' : 'Show score breakdown'}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="inline-block"
        >
          ↓
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4">
              {positives.length > 0 && (
                <div>
                  <p className="font-syne text-xs text-text-3 uppercase tracking-wider mb-2">
                    Positive factors
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {positives.map((f, i) => (
                      <ChipFactor
                        key={`pos-${i}`}
                        label={f.label || f.reason || f}
                        value={f.value ?? f.points ?? 2}
                        isPositive
                      />
                    ))}
                  </div>
                </div>
              )}
              {negatives.length > 0 && (
                <div>
                  <p className="font-syne text-xs text-text-3 uppercase tracking-wider mb-2">
                    Negative factors
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {negatives.map((f, i) => (
                      <ChipFactor
                        key={`neg-${i}`}
                        label={f.label || f.reason || f}
                        value={f.value ?? f.points ?? 2}
                        isPositive={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
