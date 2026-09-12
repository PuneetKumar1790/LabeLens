import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const DEFAULT_CHECKOUT_URL =
  'https://labellens.lemonsqueezy.com/checkout/buy/c8808b7d-5797-4fc6-a14e-ae0c82bcf502'

const perks = [
  {
    title: 'Unlimited AI Food Label Scans',
    desc: 'No daily or monthly limits. Scan every grocery item in your cart.',
    icon: '⚡',
  },
  {
    title: 'Side-by-Side Product Compare',
    desc: 'Compare two competing brands side-by-side with automatic winner rationale.',
    icon: '⚔️',
  },
  {
    title: 'Ask AI Contextual Nutritionist',
    desc: 'Chat contextually about any scanned product with one-tap health goal presets.',
    icon: '💬',
  },
  {
    title: 'Deep-Dive Ingredient & Additive Guard',
    desc: 'Instant detection of 60+ hidden sugars, harmful preservatives, and E-numbers.',
    icon: '🛡️',
  },
  {
    title: 'Personalized Allergen Filtering',
    desc: 'Smart monitoring for dairy, gluten, nuts, palm oil, artificial sweeteners, and more.',
    icon: '🎯',
  },
]

export const UpgradeModal = ({ isOpen, onClose, triggerReason = '' }) => {
  const { user, fetchProfile } = useAuth()

  useEffect(() => {
    // Initialize Lemon Squeezy overlay if available
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

    // Try overlay first; fallback to opening in new tab
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
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-bg-card shadow-2xl"
        >
          {/* Top Banner Accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-accent via-emerald-400 to-amber-400" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-bg/80 text-text-3 transition-colors hover:border-text-2 hover:text-text-1"
            aria-label="Close modal"
          >
            ✕
          </button>

          <div className="p-6 sm:p-8">
            {/* Tag */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[11px] font-medium tracking-wide text-accent">
              <span>✦</span>
              <span>LabeLens Pro Membership</span>
            </div>

            {/* Title */}
            <h2 className="mt-4 font-serif text-2xl font-bold tracking-tight text-text-1 sm:text-3xl">
              See Beyond Every Label.
            </h2>

            {triggerReason ? (
              <p className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 font-syne text-xs text-amber-300">
                {triggerReason}
              </p>
            ) : (
              <p className="mt-2 font-syne text-sm text-text-2">
                Upgrade to Pro to eliminate scan limits and make smarter dietary decisions every day.
              </p>
            )}

            {/* Feature List */}
            <div className="mt-6 space-y-3.5">
              {perks.map((p, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-bg text-xs">
                    {p.icon}
                  </div>
                  <div>
                    <h4 className="font-syne text-xs font-semibold text-text-1">{p.title}</h4>
                    <p className="font-syne text-[11px] leading-relaxed text-text-3">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Box & CTA */}
            <div className="mt-7 rounded-xl border border-border bg-bg p-4 sm:p-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="font-mono text-xs text-text-3 uppercase tracking-wider">Plan</span>
                  <p className="font-syne text-sm font-semibold text-text-1">Pro Unlimited</p>
                </div>
                <div className="text-right">
                  <span className="font-serif text-2xl font-bold text-accent">₹399</span>
                  <span className="font-mono text-xs text-text-3"> / month</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="mt-4 w-full rounded-lg bg-accent py-3 font-syne text-sm font-bold text-bg transition-transform hover:brightness-105 active:scale-[0.99]"
              >
                Upgrade to Pro Now →
              </button>

              <div className="mt-3 flex items-center justify-center gap-4 font-mono text-[10px] text-text-3">
                <span>✓ Cancel anytime</span>
                <span>✓ Instant activation</span>
                <span>✓ Secure checkout</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
