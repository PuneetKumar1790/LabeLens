import { motion } from 'framer-motion'
import { reveal } from './motion'

const steps = [
  {
    number: '01',
    title: 'Upload the label',
    description:
      'Point your camera at the back of any packaged food, or upload an image from your gallery.',
  },
  {
    number: '02',
    title: 'AI reads everything',
    description:
      'Our analyzer reads every ingredient, additive, E-number, and nutritional value on the label.',
  },
  {
    number: '03',
    title: 'Get your score',
    description:
      "Receive a 1-10 rating with a full breakdown - what's good, what to avoid, and a plain-English verdict.",
  },
]

export const HowItWorks = () => (
  <section id="process" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Process</p>
      <h2 className="section-title mt-3 font-serif text-text-1">How LabelLens works</h2>
    </motion.div>

    <div className="relative mt-16 grid gap-10 md:grid-cols-3">
      <div className="absolute left-[15%] right-[15%] top-4 hidden h-px bg-accent/40 md:block" />
      {steps.map((step, index) => (
        <motion.div
          key={step.number}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.08 }}
          className="relative"
        >
          <div className="mb-8 inline-flex bg-bg pr-5 font-mono text-[11px] uppercase tracking-[0.24em] text-accent">
            {step.number}
          </div>
          <h3 className="font-syne text-[22px] font-bold text-text-1">{step.title}</h3>
          <p className="mt-4 max-w-[260px] font-syne text-[15px] leading-7 text-text-2">
            {step.description}
          </p>
        </motion.div>
      ))}
    </div>
  </section>
)
