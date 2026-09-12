import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import {
  BoltIcon,
  CompareIcon,
  ChatIcon,
  ShieldIcon,
  TargetIcon,
  SparkleIcon,
  CheckCircleIcon,
} from './Icons'

const DEFAULT_CHECKOUT_URL =
  'https://labellens.lemonsqueezy.com/checkout/buy/c8808b7d-5797-4fc6-a14e-ae0c82bcf502'

const perks = [
  {
    title: 'Unlimited AI Food Label Scans',
    desc: 'No daily or monthly limits. Scan every grocery item in your cart.',
    icon: <BoltIcon className="h-4 w-4" />,
    badgeClass: 'border-[#3E5216] bg-[#1E2812] text-accent',
  },
  {
    title: 'Side-by-Side Product Compare',
    desc: 'Compare two competing brands side-by-side with automatic winner rationale.',
    icon: <CompareIcon className="h-4 w-4" />,
    badgeClass: 'border-[#165038] bg-[#0F281E] text-emerald-400',
  },
  {
    title: 'Ask AI Contextual Nutritionist',
    desc: 'Chat contextually about any scanned product with one-tap health goal presets.',
    icon: <ChatIcon className="h-4 w-4" />,
    badgeClass: 'border-[#14475A] bg-[#0F242C] text-cyan-400',
  },
  {
    title: 'Deep-Dive Ingredient & Additive Guard',
    desc: 'Instant detection of 60+ hidden sugars, harmful preservatives, and E-numbers.',
    icon: <ShieldIcon className="h-4 w-4" />,
    badgeClass: 'border-[#583E16] bg-[#2D1F0E] text-amber-400',
  },
  {
    title: 'Personalized Allergen Filtering',
    desc: 'Smart monitoring for dairy, gluten, nuts, palm oil, artificial sweeteners, and more.',
    icon: <TargetIcon className="h-4 w-4" />,
    badgeClass: 'border-[#442E68] bg-[#221832] text-purple-400',
  },
]

export const UpgradeModal = ({ isOpen, onClose, triggerReason = '' }) => {
  const { user, fetchProfile } = useAuth()

  useEffect(() => {
    if (window.createLemonSqueezy) {
      window.createLemonSqueezy()
    }

    const handleLemonEvent = (event) => {
      if (event?.event === 'Checkout.Success') {
        fetchProfile()
        if (onClose) onClose()
      }
    }

    if (window.LemonSqueezy?.Setup) {
      window.LemonSqueezy.Setup({
        eventHandler: handleLemonEvent,
      })
    }
  }, [fetchProfile, onClose])

  if (!isOpen) return null

  const handleCheckout = () => {
    const baseCheckoutUrl =
      import.meta.env.VITE_LEMON_SQUEEZY_CHECKOUT_URL || DEFAULT_CHECKOUT_URL

    let finalUrl = baseCheckoutUrl
    const params = new URLSearchParams()

    if (user?.email) {
      params.append('checkout[email]', user.email)
    }
    if (user?._id) {
      params.append('checkout[custom][user_id]', user._id)
    }

    const queryString = params.toString()
    if (queryString) {
      finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryString
    }

    try {
      if (window.LemonSqueezy?.Url?.Open) {
        window.LemonSqueezy.Url.Open(finalUrl)
      } else {
        window.open(finalUrl, '_blank')
      }
    } catch {
      window.open(finalUrl, '_blank')
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Container — fully opaque solid background */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-[#27272A] bg-[#111113] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)]"
        >
          {/* Top Banner Accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-accent via-emerald-400 to-amber-400" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#2E2E34] bg-[#18181B] text-[#A1A1AA] transition-colors hover:border-[#3F3F46] hover:text-white"
            aria-label="Close modal"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="p-6 sm:p-8">
            {/* Tag */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-3 py-1 font-mono text-[11px] font-semibold tracking-wide text-accent">
              <SparkleIcon className="h-3 w-3 text-accent" />
              <span>LabeLens Pro Membership</span>
            </div>

            {/* Title */}
            <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#F4F4F5] sm:text-4xl">
              See Beyond Every Label.
            </h2>

            {triggerReason ? (
              <p className="mt-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 font-syne text-xs font-medium text-amber-300">
                {triggerReason}
              </p>
            ) : (
              <p className="mt-2.5 font-syne text-[13px] leading-relaxed text-[#A1A1AA]">
                Upgrade to Pro to eliminate scan limits and make smarter dietary decisions every day.
              </p>
            )}

            {/* Feature List */}
            <div className="mt-6 space-y-3">
              {perks.map((p, idx) => (
                <div key={idx} className="flex items-start gap-3.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-sm ${p.badgeClass}`}
                  >
                    {p.icon}
                  </div>
                  <div className="pt-0.5">
                    <h4 className="font-syne text-[13px] font-bold text-[#F4F4F5]">{p.title}</h4>
                    <p className="font-syne text-[12px] leading-relaxed text-[#A1A1AA]">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Box & CTA */}
            <div className="mt-7 rounded-xl border border-[#27272A] bg-[#18181B] p-5 shadow-lg">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
                    Plan
                  </span>
                  <p className="font-syne text-base font-bold text-[#F4F4F5]">Pro Unlimited</p>
                </div>
                <div className="text-right">
                  <span className="font-serif text-3xl font-bold text-accent">$6.99</span>
                  <span className="font-mono text-xs text-[#A1A1AA]"> / month</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3.5 font-syne text-sm font-bold text-[#080808] transition-all hover:brightness-110 active:scale-[0.99] shadow-[0_4px_16px_rgba(212,245,60,0.25)]"
              >
                <span>Upgrade to Pro Now</span>
                <span aria-hidden="true">→</span>
              </button>

              <div className="mt-3.5 flex flex-wrap items-center justify-center gap-4 font-mono text-[11px] text-[#D4D4D8]">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircleIcon className="h-3.5 w-3.5 text-accent" /> Cancel anytime
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircleIcon className="h-3.5 w-3.5 text-accent" /> Instant activation
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircleIcon className="h-3.5 w-3.5 text-accent" /> Secure checkout
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
