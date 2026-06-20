import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircleIcon, AlertTriangleIcon } from './Icons'

const alertVariants = {
  hidden: { opacity: 0, y: -10 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.35, ease: 'easeOut' },
  }),
}

const AlertBanner = ({ alert, index }) => {
  const level = alert.level || alert.type || 'danger'

  const styles = {
    danger: {
      border: 'border-red-500/40',
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      icon: <AlertCircleIcon className="h-5 w-5" />,
      prefix: 'Allergy Alert',
    },
    warning: {
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      icon: <AlertTriangleIcon className="h-5 w-5" />,
      prefix: 'Possible Risk',
    },
    info: {
      border: 'border-yellow-500/40',
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      icon: <AlertTriangleIcon className="h-5 w-5" />,
      prefix: 'Personal Avoidance',
    },
  }

  const s = styles[level] || styles.danger
  const message = alert.message || alert.ingredient || alert.label || 'Unknown alert'

  return (
    <motion.div
      custom={index}
      variants={alertVariants}
      initial="hidden"
      animate="show"
      className={`flex items-start gap-3 rounded-xl border px-5 py-4 ${s.border} ${s.bg}`}
    >
      <span className={`shrink-0 leading-5 ${level === 'danger' ? 'text-red-500' : 'text-amber-500'}`}>{s.icon}</span>
      <p className={`font-syne text-sm leading-5 ${s.text}`}>
        <strong>{s.prefix} —</strong>{' '}
        {level === 'danger'
          ? `Contains ${message}`
          : level === 'warning'
          ? `May contain traces of ${message}`
          : `Contains ${message}`}
      </p>
    </motion.div>
  )
}

export const AllergyAlerts = ({ alerts = [] }) => {
  const [expanded, setExpanded] = useState(false)

  if (!alerts || alerts.length === 0) return null

  const visible = expanded ? alerts : alerts.slice(0, 3)
  const hasMore = alerts.length > 3

  return (
    <div className="mb-6 space-y-2">
      <AnimatePresence>
        {visible.map((alert, i) => (
          <AlertBanner key={`${alert.ingredient || alert.message || i}`} alert={alert} index={i} />
        ))}
      </AnimatePresence>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="w-full rounded-xl border border-border px-5 py-2.5 font-syne text-xs text-text-2 hover:text-text-1 transition-colors text-center"
        >
          {expanded ? `Show fewer alerts ↑` : `Show ${alerts.length - 3} more alerts ↓`}
        </button>
      )}
    </div>
  )
}
