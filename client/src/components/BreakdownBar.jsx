import { motion } from 'framer-motion'
import { clsx } from 'clsx'

const levelColor = {
  Low: '#4ADE80',
  Medium: '#F5A524',
  High: '#FF4545',
}

export const BreakdownBar = ({ label, level, score }) => {
  const color = levelColor[level] || '#D4F53C'
  const pct = (Number(score) / 10) * 100

  return (
    <div className="grid grid-cols-[78px_1fr_36px_74px] items-center gap-3 py-2 max-sm:grid-cols-[74px_1fr_34px] max-sm:[&>span:last-child]:col-start-2">
      <span className="font-syne text-sm font-semibold text-text-1">{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
      <span className="text-right font-mono text-xs" style={{ color }}>
        {Number(score).toFixed(1)}
      </span>
      <span
        className={clsx(
          'w-fit rounded-sm px-2 py-0.5 font-syne text-xs',
          level === 'Low' && 'bg-green-500/10 text-green-400',
          level === 'Medium' && 'bg-amber-500/10 text-amber-400',
          level === 'High' && 'bg-red-500/10 text-red-400',
        )}
      >
        {level}
      </span>
    </div>
  )
}
