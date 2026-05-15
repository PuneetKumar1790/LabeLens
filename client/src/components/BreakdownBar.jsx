import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { scoreColor } from '../utils/scoreColor'

const amountTone = {
  harmful: {
    Low: 'bg-green-500/10 text-green-400',
    Medium: 'bg-amber-500/10 text-amber-400',
    High: 'bg-red-500/10 text-red-400',
  },
  beneficial: {
    Low: 'bg-red-500/10 text-red-400',
    Medium: 'bg-amber-500/10 text-amber-400',
    High: 'bg-green-500/10 text-green-400',
  },
}

export const BreakdownBar = ({ label, level, score, kind = 'harmful' }) => {
  const value = Math.min(10, Math.max(1, Number(score) || 5))
  const color = scoreColor(value).text
  const pct = (value / 10) * 100
  const amountClass = amountTone[kind]?.[level] || 'bg-amber-500/10 text-amber-400'

  return (
    <div className="py-4">
      <div className="flex items-center justify-between gap-4">
        <span className="font-syne text-sm font-semibold text-text-1">{label}</span>
        <span className="font-mono text-xs" style={{ color }}>
          {value.toFixed(1)}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-4">
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: pct / 100 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          />
        </div>
        <span className={clsx('w-fit rounded-sm px-2.5 py-1 font-syne text-xs', amountClass)}>
          {level} amount
        </span>
      </div>
    </div>
  )
}
