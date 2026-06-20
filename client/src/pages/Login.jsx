import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { Logo } from '../components/Logo'
import { TargetIcon, AlertCircleIcon, HistoryListIcon } from '../components/Icons'

const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

const features = [
  { icon: <TargetIcon className="h-5 w-5" />, label: 'Personalized scoring' },
  { icon: <AlertCircleIcon className="h-5 w-5" />, label: 'Allergy detection' },
  { icon: <HistoryListIcon className="h-5 w-5" />, label: 'Scan history' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export const Login = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const oauthError = searchParams.get('error')

  const handleGoogleSignIn = () => {
    window.location.href = `${apiBase}/api/auth/google`
  }

  const handleGuest = () => {
    navigate('/scan')
  }

  return (
    <div className="relative min-h-screen bg-bg text-text-1 overflow-hidden flex flex-col items-center justify-center px-5">
      {/* Animated background grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #1E1E1E 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.6,
        }}
      />

      {/* Glow orbs */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[520px] w-[520px] rounded-full"
        style={{
          background:
            'radial-gradient(circle at center, rgba(212,245,60,0.12) 0%, transparent 70%)',
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-3 mb-10">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-10 w-10" />
            <span className="font-syne text-xl font-semibold tracking-tight text-text-1">
              LabelLens
            </span>
          </Link>
          <p className="font-serif text-lg italic text-text-2 text-center">
            Know what's really in your food.
          </p>
        </motion.div>

        {/* Main card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-8 shadow-2xl shadow-bg/80"
        >
          <motion.h1
            variants={itemVariants}
            className="font-syne text-2xl font-bold text-text-1 text-center mb-2"
          >
            Welcome back
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="font-syne text-sm text-text-2 text-center mb-8"
          >
            Sign in to track scans, set preferences, and get personalized nutrition scores.
          </motion.p>

          {/* OAuth error */}
          <AnimatePresence>
            {oauthError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center"
              >
                <p className="font-syne text-sm text-red-400">
                  Sign-in failed. Please try again.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Sign-In */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02, backgroundColor: '#c8ed35' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-accent px-5 py-4 font-syne text-base font-bold text-bg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
              />
              <path
                fill="#FF3D00"
                d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
              />
            </svg>
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div className="relative my-6 flex items-center">
            <div className="flex-1 h-px bg-border" />
            <span className="mx-4 font-syne text-xs text-text-3">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Guest */}
          <motion.button
            variants={itemVariants}
            whileHover={{ color: '#EDEDED' }}
            onClick={handleGuest}
            type="button"
            className="w-full text-center font-syne text-sm text-text-2 transition-colors hover:text-text-1"
          >
            Continue as Guest →
          </motion.button>
        </motion.div>

        {/* Feature bullets */}
        <motion.div variants={itemVariants} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-1.5">
              <span className="text-sm">{f.icon}</span>
              <span className="font-syne text-xs text-text-2">{f.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
