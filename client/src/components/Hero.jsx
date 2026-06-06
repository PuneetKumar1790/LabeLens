import { Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeUp, stagger } from './motion'

const miniBars = [
  { label: 'Sugar', value: 0, color: '#4ADE80', note: '0g' },
  { label: 'Sodium', value: 35, color: '#F5A524', note: '35mg' },
  { label: 'Sweetener', value: 70, color: '#FF4545', note: 'Sucralose' },
  { label: 'Additives', value: 60, color: '#F5A524', note: '3' },
]

const callouts = [
  { label: 'Sweeteners detected', value: 'Sucralose' },
  { label: 'Additives detected', value: '3 additives' },
  { label: 'Nutrition profile', value: 'Zero sugar, zero calories' },
]

function OptimizedCardImage() {
  const [loaded, setLoaded] = useState(false)
  return (
    <picture>
      <source type="image/avif" srcSet="/assets/card.lossless.avif" />
      <source
        type="image/webp"
        srcSet="/assets/card-480.lossless.webp 480w, /assets/card-800.lossless.webp 800w, /assets/card.lossless.webp 1200w"
        sizes="(max-width: 480px) 480px, (max-width: 800px) 800px, 1200px"
      />
      <img
        src="/assets/card.png"
        alt="AI analysis of a Virtue Elevate drink label showing sucralose, additives, and a 4.8 out of 10 score"
        loading="eager"
        decoding="async"
        fetchpriority="high"
        onLoad={() => setLoaded(true)}
        className={`h-auto max-h-[220px] w-full object-cover object-top transition-opacity duration-300 sm:max-h-[250px] sm:object-contain md:max-h-[280px] lg:max-h-[300px] xl:max-h-[320px] 2xl:max-h-none ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </picture>
  )
}

export const Hero = () => (
  <section className="relative overflow-hidden bg-dot-grid bg-dot-32">
    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-bg" />
    <div className="mx-auto grid min-h-[calc(100vh-56px)] max-w-7xl items-center gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 min-w-0 max-w-3xl"
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
          See <span className="block italic sm:inline">Beyond</span>
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
          <span>∅ No data stored</span>
          <span>◎ Free to use</span>
        </motion.div>
      </motion.div>

      <div className="relative z-10 min-h-[500px] min-w-0 lg:min-h-[540px] xl:min-h-[620px] 2xl:min-h-[680px]">
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="relative mx-auto w-full max-w-[400px] origin-top rounded-lg border border-border bg-surface p-4 shadow-2xl shadow-black/40 sm:max-w-[420px] sm:p-5 lg:max-w-[420px] lg:scale-[0.8] xl:max-w-[440px] xl:scale-[0.86] 2xl:max-w-[480px] 2xl:scale-100"
        >
          <div className="overflow-hidden rounded-lg border border-border bg-bg">
            {/* Optimized image: served from public assets so we can preload it in index.html */}
            {/* Fade-in on load to reduce perceived progressive rendering */}
            <OptimizedCardImage />
          </div>

          <div className="py-5 text-center sm:py-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Virtue Elevate</p>
            <div className="mt-2 font-mono text-[56px] leading-none text-score-mid sm:text-[64px]">4.8</div>
            <div className="-mt-1 font-syne text-sm text-text-2">/10</div>
            <p className="mt-3 font-syne text-sm italic text-text-2">
              Moderate. Clean macros, but artificial sweeteners and additives need context.
            </p>
          </div>

          <div className="mb-4 grid gap-2.5 sm:grid-cols-3">
            {callouts.map((callout) => (
              <div key={callout.label} className="rounded-md border border-border bg-bg/60 p-2.5">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-text-3">{callout.label}</p>
                <p className="mt-2 font-syne text-xs font-semibold text-text-1">{callout.value}</p>
              </div>
            ))}
          </div>

          <div className="hidden space-y-3 pb-1 md:block">
            {miniBars.map((bar) => (
              <div key={bar.label} className="grid grid-cols-[82px_1fr_64px] items-center gap-3">
                <span className="font-syne text-xs text-text-2">{bar.label}</span>
                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full" style={{ width: `${bar.value}%`, backgroundColor: bar.color }} />
                </div>
                <span className="text-right font-mono text-[10px] text-text-3">{bar.note}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
)
