import { motion } from 'framer-motion'
import { AlertIcon, BoltIcon, ChartIcon, GaugeIcon, PackageIcon, ZeroIcon } from './Icons'

const features = [
  {
    icon: PackageIcon,
    title: 'Ingredient Scanner',
    description: 'Identifies every additive, preservative, and E-number by name.',
  },
  {
    icon: ChartIcon,
    title: 'Nutrition Breakdown',
    description: 'Sugar, sodium, fat, protein, and fiber - all put in plain context.',
  },
  {
    icon: AlertIcon,
    title: 'Additive Alerts',
    description: 'Flags artificial colors, flavor enhancers, and WHO-listed harmful chemicals.',
  },
  {
    icon: GaugeIcon,
    title: 'Smart Scoring',
    description: 'A 1-10 rating calibrated to real nutritional guidelines, not marketing claims.',
  },
  {
    icon: BoltIcon,
    title: 'Under 5 Seconds',
    description: 'Fast label analysis with near-instant responses.',
  },
  {
    icon: ZeroIcon,
    title: 'Zero Storage',
    description: 'Your images are never saved. Analysis is real-time and ephemeral.',
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
