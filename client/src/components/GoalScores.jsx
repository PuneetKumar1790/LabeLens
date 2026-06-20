import { motion } from 'framer-motion'
import { ScaleIcon, DumbbellIcon, LeafIcon, HeartIcon, TargetIcon } from './Icons'

const GOAL_ICONS = {
  'Weight Loss': <ScaleIcon className="h-4 w-4" />,
  'Muscle Gain': <DumbbellIcon className="h-4 w-4" />,
  'General Health': <LeafIcon className="h-4 w-4" />,
  'Diabetes Friendly': <TargetIcon className="h-4 w-4" />,
  'Heart Health': <HeartIcon className="h-4 w-4" />,
}

const barColor = (score) => {
  if (score >= 7) return 'bg-green-400'
  if (score >= 4) return 'bg-amber-400'
  return 'bg-red-400'
}

const textColor = (score) => {
  if (score >= 7) return 'text-green-400'
  if (score >= 4) return 'text-amber-400'
  return 'text-red-400'
}

const GoalBar = ({ label, score, index }) => {
  const pct = Math.min(100, Math.max(0, (Number(score) / 10) * 100))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-text-3 shrink-0">{GOAL_ICONS[label] || <TargetIcon className="h-4 w-4" />}</span>
          <span className="font-syne text-xs text-text-2">{label}</span>
        </div>
        <span className={`font-mono text-xs font-semibold ${textColor(score)}`}>
          {Number(score).toFixed(1)}/10
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColor(score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: index * 0.1 + 0.2, duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  )
}

export const GoalScores = ({ scores }) => {
  if (!scores || Object.keys(scores).length === 0) return null

  const entries = Object.entries(scores)

  return (
    <div className="mt-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent mb-5">
        Goal Match
      </p>
      <div className="rounded-xl border border-border bg-surface p-5 space-y-5">
        {entries.map(([label, score], i) => (
          <GoalBar key={label} label={label} score={score} index={i} />
        ))}
      </div>
    </div>
  )
}
