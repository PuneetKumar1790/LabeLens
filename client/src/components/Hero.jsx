import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeUp, stagger } from './motion'

const miniBars = [
  { label: 'Sugar', value: 76, color: '#FF4545' },
  { label: 'Additives', value: 58, color: '#F5A524' },
  { label: 'Protein', value: 38, color: '#4ADE80' },
  { label: 'Fiber', value: 46, color: '#D4F53C' },
]

export const Hero = () => (
  <section className="relative overflow-hidden bg-dot-grid bg-dot-32">
    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-bg" />
    <div className="mx-auto grid min-h-[calc(100vh-56px)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-3xl"
      >
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mb-6 inline-flex rounded-full border border-border px-3 py-1 font-mono text-xs text-text-2"
        >
          ✦ AI-Powered Nutrition Analysis
        </motion.div>
        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="hero-title font-serif text-text-1"
        >
          See <span className="italic">Beyond</span>
          <br />
          the Label.
        </motion.h1>
        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mt-7 max-w-[480px] font-syne text-lg leading-8 text-text-2"
        >
          Upload any packaged food label. Our AI reads every ingredient, additive, and nutrition
          value - then gives you a score out of 10.
        </motion.p>
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <Link
            to="/scan"
            className="rounded-sm bg-accent px-6 py-3 font-syne text-sm font-bold text-bg"
          >
            Scan Your First Label →
          </Link>
          <a href="#process" className="font-syne text-sm text-text-2 underline-offset-4 hover:underline">
            See how it works ↓
          </a>
        </motion.div>
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mt-8 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-text-3"
        >
          <span>⚡ Groq · Llama 4 Scout</span>
          <span>∅ No data stored</span>
          <span>◎ Free to use</span>
        </motion.div>
      </motion.div>

      <div className="relative z-10 min-h-[480px] lg:min-h-[600px]">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="relative mx-auto max-w-[420px] rounded-2xl border border-border bg-surface p-6"
        >
          <div className="relative h-52 overflow-hidden rounded-xl border border-border bg-[linear-gradient(135deg,#241f16,#393515_42%,#171717_43%,#101010_100%)]">
            <div className="absolute left-6 top-6 h-28 w-28 rotate-[-12deg] border border-accent/40 bg-accent/15 blur-[1px]" />
            <div className="absolute bottom-5 right-5 h-32 w-20 rotate-6 border border-text-2/40 bg-bg/60" />
            <div className="absolute inset-0 backdrop-blur-[1.5px]" />
            <p className="absolute bottom-5 left-5 font-mono text-[10px] uppercase text-text-3">
              sample label render
            </p>
          </div>

          <div className="py-8 text-center">
            <div className="font-mono text-[72px] leading-none text-score-mid">6.4</div>
            <div className="-mt-1 font-syne text-sm text-text-2">/10</div>
            <p className="mt-4 font-syne text-sm italic text-text-2">
              Moderate. Watch the sugar content.
            </p>
          </div>

          <div className="space-y-4">
            {miniBars.map((bar) => (
              <div key={bar.label} className="grid grid-cols-[76px_1fr_38px] items-center gap-3">
                <span className="font-syne text-xs text-text-2">{bar.label}</span>
                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full" style={{ width: `${bar.value}%`, backgroundColor: bar.color }} />
                </div>
                <span className="font-mono text-xs text-text-3">{bar.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
)
