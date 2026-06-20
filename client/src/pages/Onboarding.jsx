import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

const HEALTH_GOALS = [
  'Weight Loss',
  'Muscle Gain',
  'General Health',
  'Diabetes Friendly',
  'Heart Health',
  'High Protein',
  'Low Sugar',
]
const DIETARY_PREFS = ['Vegetarian', 'Vegan', 'Jain', 'Halal']
const COMMON_ALLERGENS = [
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Tree Nuts',
  'Peanuts',
  'Wheat',
  'Soybeans',
  'Sesame',
]
const AVOIDED_SUGGESTIONS = [
  'Palm Oil',
  'MSG',
  'Aspartame',
  'High Fructose Corn Syrup',
  'Maltodextrin',
  'Carrageenan',
  'BHA/BHT',
  'Artificial Colors',
]

const STEPS = ['Health Goals', 'Dietary Preferences', 'Allergy Profile', 'Avoided Ingredients']

const ChipToggle = ({ label, selected, onToggle }) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.95 }}
    onClick={() => onToggle(label)}
    className={`rounded-full border px-4 py-2 font-syne text-sm transition-all ${
      selected
        ? 'border-accent bg-accent text-bg font-semibold'
        : 'border-border text-text-2 hover:border-text-3 hover:text-text-1'
    }`}
  >
    {label}
  </motion.button>
)

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 64 : -64, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -64 : 64, opacity: 0 }),
}

export const Onboarding = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [saving, setSaving] = useState(false)

  const [goals, setGoals] = useState([])
  const [dietary, setDietary] = useState([])
  const [commonAllergens, setCommonAllergens] = useState([])
  const [customAllergens, setCustomAllergens] = useState([])
  const [customAllergenInput, setCustomAllergenInput] = useState('')
  const [avoided, setAvoidedIngredients] = useState([])
  const [avoidedInput, setAvoidedInput] = useState('')

  const toggle = (list, setList) => (item) => {
    setList((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]))
  }

  const addCustomAllergen = () => {
    const val = customAllergenInput.trim()
    if (val && !customAllergens.includes(val)) {
      setCustomAllergens((prev) => [...prev, val])
      setCustomAllergenInput('')
    }
  }

  const addAvoided = (item) => {
    if (item && !avoided.includes(item)) {
      setAvoidedIngredients((prev) => [...prev, item])
      setAvoidedInput('')
    }
  }

  const goNext = () => {
    if (step < STEPS.length - 1) {
      setDirection(1)
      setStep((s) => s + 1)
    }
  }

  const goBack = () => {
    if (step > 0) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }

  const handleSkip = () => {
    if (step < STEPS.length - 1) goNext()
    else handleFinish()
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      await Promise.all([
        api.put('/api/user/preferences', { healthGoals: goals, dietaryPreferences: dietary }),
        api.put('/api/user/allergies', { commonAllergens, customAllergens }),
        api.put('/api/user/avoided', { ingredients: avoided }),
        api.put('/api/user/settings', { onboardingCompleted: true }),
      ])
    } catch {
      // best effort
    }
    navigate('/scan')
  }

  const stepContent = [
    // Step 0: Health Goals
    <div key="goals" className="space-y-5">
      <div>
        <h2 className="font-syne text-xl font-bold text-text-1">What are your health goals?</h2>
        <p className="mt-1 font-syne text-sm text-text-2">
          We'll personalize your nutrition scores based on your goals.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        {HEALTH_GOALS.map((g) => (
          <ChipToggle key={g} label={g} selected={goals.includes(g)} onToggle={toggle(goals, setGoals)} />
        ))}
      </div>
    </div>,

    // Step 1: Dietary Preferences
    <div key="dietary" className="space-y-5">
      <div>
        <h2 className="font-syne text-xl font-bold text-text-1">Dietary preferences</h2>
        <p className="mt-1 font-syne text-sm text-text-2">
          Labels will be checked against your dietary requirements.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 pt-2">
        {DIETARY_PREFS.map((d) => (
          <ChipToggle key={d} label={d} selected={dietary.includes(d)} onToggle={toggle(dietary, setDietary)} />
        ))}
      </div>
    </div>,

    // Step 2: Allergy Profile
    <div key="allergies" className="space-y-5">
      <div>
        <h2 className="font-syne text-xl font-bold text-text-1">Allergy profile</h2>
        <p className="mt-1 font-syne text-sm text-text-2">
          We'll flag any allergens detected in scanned products.
        </p>
      </div>
      <div>
        <p className="font-syne text-xs text-text-3 uppercase tracking-widest mb-3">Common allergens</p>
        <div className="flex flex-wrap gap-3">
          {COMMON_ALLERGENS.map((a) => (
            <ChipToggle
              key={a}
              label={a}
              selected={commonAllergens.includes(a)}
              onToggle={toggle(commonAllergens, setCommonAllergens)}
            />
          ))}
        </div>
      </div>
      <div>
        <p className="font-syne text-xs text-text-3 uppercase tracking-widest mb-3">Custom allergens</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customAllergenInput}
            onChange={(e) => setCustomAllergenInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomAllergen()}
            placeholder="Type allergen and press Enter"
            className="flex-1 rounded-lg border border-border bg-bg px-4 py-2.5 font-syne text-sm text-text-1 placeholder:text-text-3 focus:border-accent/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={addCustomAllergen}
            className="rounded-lg border border-border px-4 py-2 font-syne text-sm text-text-2 hover:text-text-1 transition-colors"
          >
            Add
          </button>
        </div>
        {customAllergens.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {customAllergens.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 font-syne text-xs text-text-2"
              >
                {a}
                <button
                  type="button"
                  onClick={() => setCustomAllergens((prev) => prev.filter((x) => x !== a))}
                  className="text-text-3 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>,

    // Step 3: Avoided Ingredients
    <div key="avoided" className="space-y-5">
      <div>
        <h2 className="font-syne text-xl font-bold text-text-1">Ingredients to avoid</h2>
        <p className="mt-1 font-syne text-sm text-text-2">
          Personal preferences — we'll warn you if a scanned product contains these.
        </p>
      </div>
      <div>
        <p className="font-syne text-xs text-text-3 uppercase tracking-widest mb-3">Suggestions</p>
        <div className="flex flex-wrap gap-3">
          {AVOIDED_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addAvoided(s)}
              disabled={avoided.includes(s)}
              className={`rounded-full border px-4 py-2 font-syne text-sm transition-all ${
                avoided.includes(s)
                  ? 'border-accent bg-accent text-bg font-semibold'
                  : 'border-border text-text-2 hover:border-text-3 hover:text-text-1'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex gap-2">
          <input
            type="text"
            value={avoidedInput}
            onChange={(e) => setAvoidedInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addAvoided(avoidedInput.trim())}
            placeholder="Type ingredient and press Enter"
            className="flex-1 rounded-lg border border-border bg-bg px-4 py-2.5 font-syne text-sm text-text-1 placeholder:text-text-3 focus:border-accent/60 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => addAvoided(avoidedInput.trim())}
            className="rounded-lg border border-border px-4 py-2 font-syne text-sm text-text-2 hover:text-text-1 transition-colors"
          >
            Add
          </button>
        </div>
        {avoided.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {avoided.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 font-syne text-xs text-text-2"
              >
                {a}
                <button
                  type="button"
                  onClick={() => setAvoidedIngredients((prev) => prev.filter((x) => x !== a))}
                  className="text-text-3 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>,
  ]

  return (
    <div className="min-h-screen bg-bg text-text-1 flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="font-syne text-xs text-text-2">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="font-syne text-xs text-accent">{STEPS[step]}</span>
          </div>
          <div className="h-1 rounded-full bg-border overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={false}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-sm p-8 overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.32, ease: 'easeInOut' }}
            >
              {stepContent[step]}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={step === 0 ? undefined : goBack}
              className={`font-syne text-sm text-text-2 hover:text-text-1 transition-colors ${step === 0 ? 'invisible' : ''}`}
            >
              ← Back
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSkip}
                className="font-syne text-sm text-text-3 hover:text-text-2 transition-colors"
              >
                Skip
              </button>

              {step < STEPS.length - 1 ? (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={goNext}
                  className="rounded-lg bg-accent px-6 py-2.5 font-syne text-sm font-bold text-bg hover:bg-accent/90 transition-colors"
                >
                  Next →
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleFinish}
                  disabled={saving}
                  className="rounded-lg bg-accent px-6 py-2.5 font-syne text-sm font-bold text-bg hover:bg-accent/90 transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Finish ✓'}
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Step dots */}
        <div className="mt-6 flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-accent' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
