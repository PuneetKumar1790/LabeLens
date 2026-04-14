import { motion } from 'framer-motion'
import { FoodMark } from './Icons'

const samples = [
  {
    product: 'ChocoCrunch Cereal',
    category: 'sweet cereal',
    score: '3.8',
    color: '#FF4545',
    verdict: 'High sugar and artificial coloring. Occasional treat only.',
  },
  {
    product: 'Multigrain Wheat Crackers',
    category: 'snack crackers',
    score: '6.5',
    color: '#F5A524',
    verdict: 'Decent fiber but watch the sodium - better than average.',
  },
  {
    product: 'Roasted Almonds (Plain, Unsalted)',
    category: 'whole food snack',
    score: '9.1',
    color: '#4ADE80',
    verdict: 'Clean label. Excellent protein and healthy fats.',
  },
]

export const SampleCards = () => (
  <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Examples</p>
      <h2 className="section-title mt-3 font-serif text-text-1">What the scores look like</h2>
    </motion.div>

    <div className="mt-14">
      {samples.map((sample, index) => (
        <motion.article
          key={sample.product}
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.42, ease: 'easeOut', delay: index * 0.08 }}
          className="border-b border-border py-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-5">
              <FoodMark className="h-8 w-8 shrink-0 text-accent" />
              <div>
                <h3 className="font-syne text-lg font-semibold text-text-1">{sample.product}</h3>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-text-3">
                  {sample.category}
                </p>
                <p className="mt-5 font-syne text-sm text-text-2">{sample.verdict}</p>
              </div>
            </div>
            <div className="font-mono text-[32px] leading-none" style={{ color: sample.color }}>
              {sample.score}
              <span className="text-sm text-text-3"> / 10</span>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  </section>
)
