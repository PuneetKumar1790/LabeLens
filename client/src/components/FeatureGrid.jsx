import { motion } from 'framer-motion'
import { TargetIcon, AlertCircleIcon, HistoryListIcon, ScaleIcon, BoltIcon, PackageIcon } from './Icons'

const features = [
  {
    icon: TargetIcon,
    title: 'Personalized Scoring',
    description: 'Health scores adapted to your specific goals like Weight Loss, Muscle Gain, or Heart Health.',
  },
  {
    icon: AlertCircleIcon,
    title: 'Custom Allergy Alerts',
    description: 'Set your allergens and dietary restrictions to get instant warnings before you buy.',
  },
  {
    icon: BoltIcon,
    title: 'Ask the AI',
    description: 'Have a conversation directly with your food label to get context-specific nutritional answers.',
  },
  {
    icon: ScaleIcon,
    title: 'Side-by-Side Comparisons',
    description: 'Upload two labels to instantly see a detailed breakdown and find out which product wins.',
  },
  {
    icon: HistoryListIcon,
    title: 'Scan History',
    description: 'Automatically keep a log of everything you scan to track your dietary habits over time.',
  },
  {
    icon: PackageIcon,
    title: 'Smart Breakdown',
    description: 'Instantly identifies every hidden sugar, additive, and E-number by its real name.',
  },
]

export const FeatureGrid = () => (
  <section id="features" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Features</p>
      <h2 className="section-title mt-3 font-serif text-text-1">Built for real labels</h2>
    </motion.div>

    <div className="mt-16 grid gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
      {features.map((feature, index) => {
        const Icon = feature.icon
        return (
          <motion.article
            key={feature.title}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.04 }}
            className="border-t-2 border-accent pt-6"
          >
            <Icon className="h-5 w-5 text-accent" />
            <h3 className="mt-6 font-syne text-base font-semibold text-text-1">{feature.title}</h3>
            <p className="mt-3 font-syne text-sm leading-6 text-text-2">{feature.description}</p>
          </motion.article>
        )
      })}
    </div>
  </section>
)
