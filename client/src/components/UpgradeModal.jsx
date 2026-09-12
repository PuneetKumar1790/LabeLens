import { useEffect } from 'react'
import { createPortal } from 'react-dom'
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
    desc: 'Compare two competing brands side-by-side with winner rationale.',
    icon: <CompareIcon className="h-4 w-4" />,
    badgeClass: 'border-[#165038] bg-[#0F281E] text-emerald-400',
  },
  {
    title: 'Ask AI Contextual Nutritionist',
    desc: 'Chat contextually about any food product with health goal presets.',
    icon: <ChatIcon className="h-4 w-4" />,
    badgeClass: 'border-[#14475A] bg-[#0F242C] text-cyan-400',
  },
  {
    title: 'Deep-Dive Ingredient & Additive Guard',
    desc: 'Instant detection of 60+ hidden sugars and harmful additives.',
    icon: <ShieldIcon className="h-4 w-4" />,
    badgeClass: 'border-[#583E16] bg-[#2D1F0E] text-amber-400',
  },
  {
    title: 'Personalized Allergen Filtering',
    desc: 'Smart monitoring for dairy, gluten, nuts, palm oil, and allergens.',
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

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4 md:p-6">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Container — bounded max-height, compact padding, scrollable if needed */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 my-auto flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#27272A] bg-[#111113] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.95)]"
        >
          {/* Top Banner Accent */}
          <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-accent via-emerald-400 to-amber-400" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-3.5 top-4.5 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#2E2E34] bg-[#18181B] text-[#A1A1AA] transition-colors hover:border-[#3F3F46] hover:text-white"
            aria-label="Close modal"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Scrollable Modal Content */}
          <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            {/* Tag */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-accent">
              <SparkleIcon className="h-3 w-3 text-accent" />
              <span>LabeLens Pro Membership</span>
            </div>

            {/* Title */}
            <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#F4F4F5] sm:text-3xl">
              See Beyond Every Label.
            </h2>

            {triggerReason ? (
              <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 font-syne text-xs font-medium text-amber-300">
                {triggerReason}
              </p>
            ) : (
              <p className="mt-1 font-syne text-xs leading-relaxed text-[#A1A1AA]">
                Upgrade to Pro for unlimited label scans &amp; complete health intelligence.
              </p>
            )}

            {/* Feature List — compact, clean, all 5 points clearly laid out */}
            <div className="mt-3.5 space-y-1.5 sm:space-y-2">
              {perks.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 rounded-lg border border-[#222226] bg-[#161619]/60 px-2.5 py-1.5 sm:px-3 sm:py-2"
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border shadow-sm ${p.badgeClass}`}
                  >
                    {p.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-syne text-xs font-bold text-[#F4F4F5]">{p.title}</h4>
                    <p className="truncate font-syne text-[11px] text-[#A1A1AA]">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Box & CTA */}
            <div className="mt-3.5 rounded-xl border border-[#27272A] bg-[#161619] p-3.5 sm:mt-4 sm:p-4 shadow-md">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
                    Plan
                  </span>
                  <p className="font-syne text-sm font-bold text-[#F4F4F5]">Pro Unlimited</p>
                </div>
                <div className="text-right">
                  <span className="font-serif text-2xl font-bold text-accent sm:text-3xl">$6.99</span>
                  <span className="font-mono text-xs text-[#A1A1AA]"> / month</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 font-syne text-sm font-bold text-[#080808] shadow-[0_4px_16px_rgba(212,245,60,0.25)] transition-all hover:brightness-110 active:scale-[0.99]"
              >
                <span>Upgrade to Pro Now</span>
                <span aria-hidden="true">→</span>
              </button>

              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-3 font-mono text-[10px] text-[#D4D4D8]">
                <span className="inline-flex items-center gap-1">
                  <CheckCircleIcon className="h-3 w-3 text-accent" /> Cancel anytime
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircleIcon className="h-3 w-3 text-accent" /> Instant activation
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircleIcon className="h-3 w-3 text-accent" /> Secure checkout
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}
