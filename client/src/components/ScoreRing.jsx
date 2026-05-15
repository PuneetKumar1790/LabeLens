import { motion } from 'framer-motion'
import { scoreColor } from '../utils/scoreColor'

export const ScoreRing = ({ score }) => {
  const value = Math.min(10, Math.max(1, Number(score) || 1))
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const fill = (value / 10) * circumference
  const { text: color } = scoreColor(value)

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="90" cy="90" r={radius} fill="none" stroke="#1E1E1E" strokeWidth="6" />
        <motion.circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - fill }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-mono text-5xl font-medium" style={{ color }}>
          {value.toFixed(1)}
        </div>
        <div className="font-syne text-sm text-text-2">/ 10</div>
      </div>
    </div>
  )
}
