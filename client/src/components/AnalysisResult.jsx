import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BreakdownBar } from './BreakdownBar'
import { ScoreRing } from './ScoreRing'
import { AllergyAlerts } from './AllergyAlerts'
import { RedFlags } from './RedFlags'
import { scoreColor } from '../utils/scoreColor'
import { createShareCardFile } from '../utils/shareCard'

const breakdownLabels = {
  sugar: 'Sugar',
  protein: 'Protein',
  fiber: 'Fiber',
  additives: 'Additives',
  sodium: 'Sodium',
}

export const AnalysisResult = ({ result, onReset }) => {
  const score = Number(result.overall_score || 0)
  const tone = scoreColor(score)
  const [shareStatus, setShareStatus] = useState('idle')

  const share = async () => {
    const url = window.location.origin
    const summary = `${result.product_name}: ${score.toFixed(1)}/10 - ${result.verdict}\n${url}`

    try {
      setShareStatus('preparing')
      const image = await createShareCardFile({
        ...result,
        score_label: result.score_label || tone.label,
      })
      const files = [image]

      if (navigator.canShare?.({ files }) && navigator.share) {
        await navigator.share({
          title: 'LabelLens result',
          text: summary,
          url,
          files,
        })
        setShareStatus('shared')
        return
      }

      if (navigator.share) {
        await navigator.share({
          title: 'LabelLens result',
          text: summary,
          url,
        })
        setShareStatus('shared')
        return
      }

      await copyText(summary)
      setShareStatus('copied')
    } catch (err) {
      if (err.name === 'AbortError') return
      setShareStatus('failed')
    }
  }

  useEffect(() => {
    if (shareStatus === 'idle') return undefined

    const id = window.setTimeout(() => setShareStatus('idle'), 2200)
    return () => window.clearTimeout(id)
  }, [shareStatus])

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="rounded-xl border border-border bg-surface p-5 sm:p-8"
    >
      <div className="text-center">
        <p className="font-syne text-sm font-semibold text-text-1">🏷 {result.product_name}</p>
        <div className="mt-8">
          <ScoreRing score={score} />
        </div>
        <p className="mt-3 font-mono text-sm" style={{ color: tone.text }}>
          {result.score_label || tone.label}
        </p>
        <p className="mx-auto mt-5 max-w-xl font-serif text-2xl italic leading-8 text-text-1">
          "{result.verdict}"
        </p>
      </div>

      <div className="mt-8">
        <AllergyAlerts alerts={result.allergy_alerts || []} />
        <RedFlags flags={result.red_flags || []} />
      </div>

      <div className="mt-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Breakdown</p>
        <div className="mt-5">
          {Object.entries(breakdownLabels).map(([key, label]) => {
            const item = result.breakdown?.[key] || { level: 'Medium', score: 5 }
            return (
              <BreakdownBar
                key={key}
                label={label}
                level={item.level}
                score={Number(item.score)}
                kind={key === 'protein' || key === 'fiber' ? 'beneficial' : 'harmful'}
              />
            )
          })}
        </div>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <List title="What's good:" color="#4ADE80" items={result.positives || []} />
        <List title="Watch out for:" color="#FF4545" items={result.negatives || []} />
      </div>

      <div className="mt-12 grid gap-6 border-y border-border py-8">
        <div>
          <h3 className="font-syne text-sm font-bold text-text-1">Verdict</h3>
          <p className="mt-3 font-serif text-lg italic leading-7 text-text-1">{result.verdict}</p>
        </div>
        <div>
          <h3 className="font-syne text-sm font-bold text-text-1">Recommendation</h3>
          <p className="mt-3 font-syne text-[15px] leading-7 text-text-2">{result.recommendation}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onReset}
          className="rounded-sm border border-border px-5 py-3 font-syne text-sm font-semibold text-text-1"
        >
          Scan another label
        </button>
        <button
          type="button"
          onClick={share}
          className="rounded-sm border border-accent px-5 py-3 font-syne text-sm font-semibold text-accent"
        >
          {shareStatus === 'copied' || shareStatus === 'shared'
            ? 'Result ready'
            : shareStatus === 'preparing'
              ? 'Preparing card...'
            : shareStatus === 'failed'
              ? "Couldn't copy"
              : 'Share result'}
        </button>
      </div>
      {shareStatus !== 'idle' ? (
        <p className="mt-3 text-center font-mono text-xs text-text-2">
          {shareStatus === 'copied'
            ? 'Copied result and link to clipboard.'
            : shareStatus === 'shared'
              ? 'Shared result card.'
              : shareStatus === 'preparing'
                ? 'Creating share card image.'
                : 'Sharing was blocked by the browser.'}
        </p>
      ) : null}
    </motion.section>
  )
}

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  const copied = document.execCommand('copy')
  document.body.removeChild(textarea)

  if (!copied) {
    throw new Error('Copy command failed')
  }
}

const List = ({ title, color, items }) => (
  <div>
    <h3 className="font-syne text-sm font-bold text-text-1">{title}</h3>
    <motion.ul
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
      className="mt-4 space-y-3"
    >
      {(items.length ? items : ['No clear item detected.']).map((item) => (
        <motion.li
          key={item}
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0 },
          }}
          className="flex gap-3 font-syne text-sm leading-6 text-text-1"
        >
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span>{item}</span>
        </motion.li>
      ))}
    </motion.ul>
  </div>
)
