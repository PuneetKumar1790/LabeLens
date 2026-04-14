import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export const LiveCta = () => (
  <section className="bg-surface px-5 py-24 sm:px-8">
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto max-w-3xl text-center"
    >
      <h2 className="font-serif text-5xl leading-none text-text-1">
        Ready to know what's really in your food?
      </h2>
      <p className="mt-5 font-syne text-base text-text-2">It takes 10 seconds. No account needed.</p>
      <Link
        to="/scan"
        className="mt-8 inline-flex rounded-sm bg-accent px-8 py-4 font-syne text-base font-bold text-bg"
      >
        Start Scanning →
      </Link>
    </motion.div>
  </section>
)
