import { motion } from 'framer-motion'
import { AlertCircleIcon, AlertTriangleIcon, CheckIcon } from './Icons'

const levelStyles = {
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
}

const getLevelStyle = (flag) => {
  const level = flag.level || flag.severity || flag.type || 'amber'
  const l = String(level).toLowerCase()
  if (l === 'red' || l === 'high' || l === 'danger' || l === 'critical') return levelStyles.red
  if (l === 'green' || l === 'low' || l === 'good' || l === 'safe') return levelStyles.green
  return levelStyles.amber
}

const getLevelIcon = (flag) => {
  const level = flag.level || flag.severity || flag.type || 'amber'
  const l = String(level).toLowerCase()
  if (l === 'red' || l === 'high' || l === 'danger' || l === 'critical') return <AlertCircleIcon className="w-3 h-3" />
  if (l === 'green' || l === 'low' || l === 'good' || l === 'safe') return <CheckIcon className="w-3 h-3" />
  return <AlertTriangleIcon className="w-3 h-3" />
}

export const RedFlags = ({ flags = [] }) => {
  if (!flags || flags.length === 0) return null

  return (
    <div className="mt-5 -mx-1 overflow-x-auto">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        className="flex gap-2 pb-2 px-1 min-w-max"
      >
        {flags.map((flag, i) => {
          const label = flag.label || flag.name || flag.text || String(flag)
          const style = getLevelStyle(flag)
          const icon = getLevelIcon(flag)

          return (
            <motion.span
              key={`${label}-${i}`}
              variants={{
                hidden: { opacity: 0, x: 10 },
                show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
              }}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-syne text-xs font-medium ${style}`}
            >
              <span className="text-[10px] flex items-center justify-center">{icon}</span>
              {label}
            </motion.span>
          )
        })}
      </motion.div>
    </div>
  )
}
