import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const HEALTH_GOALS = [
  'Weight Loss', 'Muscle Gain', 'General Health',
  'Diabetes Friendly', 'Heart Health', 'High Protein', 'Low Sugar',
]
const DIETARY_PREFS = ['Vegetarian', 'Vegan', 'Jain']
const COMMON_ALLERGENS = [
  'Milk', 'Eggs', 'Fish', 'Shellfish', 'Tree Nuts',
  'Peanuts', 'Wheat', 'Soybeans', 'Sesame',
]
const AVOIDED_SUGGESTIONS = [
  'Palm Oil', 'MSG', 'Aspartame', 'High Fructose Corn Syrup',
  'Maltodextrin', 'Carrageenan', 'BHA/BHT', 'Artificial Colors',
]

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

const Toast = ({ message, type = 'success' }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 16 }}
    className={`fixed bottom-6 right-6 z-50 rounded-xl border px-5 py-3 font-syne text-sm shadow-2xl ${
      type === 'success'
        ? 'border-accent/40 bg-surface text-accent'
        : 'border-red-500/40 bg-surface text-red-400'
    }`}
  >
    {message}
  </motion.div>
)

const Section = ({ title, children, onSave, saving }) => {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <p className="font-syne text-sm font-bold text-text-1">{title}</p>
        <span className="font-mono text-text-3 text-sm">{open ? '−' : '+'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 space-y-4 border-t border-border">
              {children}
              {onSave && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={onSave}
                    disabled={saving}
                    className="rounded-lg bg-accent px-5 py-2 font-syne text-sm font-bold text-bg hover:bg-accent/90 disabled:opacity-60 transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const Profile = () => {
  const { user, fetchProfile } = useAuth()
  const [toast, setToast] = useState(null)

  const [goals, setGoals] = useState([])
  const [dietary, setDietary] = useState([])
  const [commonAllergens, setCommonAllergens] = useState([])
  const [customAllergens, setCustomAllergens] = useState([])
  const [customAllergenInput, setCustomAllergenInput] = useState('')
  const [avoided, setAvoided] = useState([])
  const [avoidedInput, setAvoidedInput] = useState('')
  const [savingSection, setSavingSection] = useState(null)

  useEffect(() => {
    const load = async () => {
      const profile = await fetchProfile()
      if (!profile) return
      setGoals(profile.prefs?.healthGoals || [])
      setDietary(profile.prefs?.dietaryPreferences || [])
      setCommonAllergens(profile.allergy?.commonAllergens || [])
      setCustomAllergens(profile.allergy?.customAllergens || [])
      setAvoided(profile.avoided?.ingredients || [])
    }
    load()
  }, [fetchProfile])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const toggle = (list, setList) => (item) => {
    setList((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]))
  }

  const savePreferences = async () => {
    setSavingSection('prefs')
    try {
      await api.put('/api/user/preferences', { healthGoals: goals, dietaryPreferences: dietary })
      showToast('Preferences saved!')
    } catch {
      showToast('Failed to save preferences', 'error')
    } finally {
      setSavingSection(null)
    }
  }

  const saveAllergies = async () => {
    setSavingSection('allergies')
    try {
      await api.put('/api/user/allergies', { commonAllergens, customAllergens })
      showToast('Allergy profile saved!')
    } catch {
      showToast('Failed to save', 'error')
    } finally {
      setSavingSection(null)
    }
  }

  const saveAvoided = async () => {
    setSavingSection('avoided')
    try {
      await api.put('/api/user/avoided', { ingredients: avoided })
      showToast('Avoided ingredients saved!')
    } catch {
      showToast('Failed to save', 'error')
    } finally {
      setSavingSection(null)
    }
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
      setAvoided((prev) => [...prev, item])
      setAvoidedInput('')
    }
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-bg text-text-1">
      <Navbar />
      <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent mb-2">Account</p>
          <h1 className="font-serif text-4xl text-text-1">Profile</h1>
        </motion.div>

        {/* User card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-xl border border-border bg-surface p-6 flex items-center gap-5 mb-8"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full border-2 border-accent/30 object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center font-syne text-2xl font-bold text-bg">
              {initial}
            </div>
          )}
          <div>
            <p className="font-syne text-lg font-bold text-text-1">{user?.name || 'User'}</p>
            <p className="font-syne text-sm text-text-2">{user?.email || ''}</p>
          </div>
        </motion.div>

        {/* Sections */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          {/* Health Goals + Dietary */}
          <Section title="Health Goals & Dietary" onSave={savePreferences} saving={savingSection === 'prefs'}>
            <div>
              <p className="font-syne text-xs text-text-3 uppercase tracking-widest mb-3">Health Goals</p>
              <div className="flex flex-wrap gap-2">
                {HEALTH_GOALS.map((g) => (
                  <ChipToggle key={g} label={g} selected={goals.includes(g)} onToggle={toggle(goals, setGoals)} />
                ))}
              </div>
            </div>
            <div>
              <p className="font-syne text-xs text-text-3 uppercase tracking-widest mb-3 mt-4">Dietary Preferences</p>
              <div className="flex flex-wrap gap-2">
                {DIETARY_PREFS.map((d) => (
                  <ChipToggle key={d} label={d} selected={dietary.includes(d)} onToggle={toggle(dietary, setDietary)} />
                ))}
              </div>
            </div>
          </Section>

          {/* Allergy Profile */}
          <Section title="Allergy Profile" onSave={saveAllergies} saving={savingSection === 'allergies'}>
            <div>
              <p className="font-syne text-xs text-text-3 uppercase tracking-widest mb-3">Common Allergens</p>
              <div className="flex flex-wrap gap-2">
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
            <div className="mt-4">
              <p className="font-syne text-xs text-text-3 uppercase tracking-widest mb-3">Custom Allergens</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAllergenInput}
                  onChange={(e) => setCustomAllergenInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomAllergen()}
                  placeholder="Add custom allergen..."
                  className="flex-1 rounded-lg border border-border bg-bg px-4 py-2 font-syne text-sm text-text-1 placeholder:text-text-3 focus:border-accent/50 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomAllergen}
                  className="rounded-lg border border-border px-4 py-2 font-syne text-sm text-text-2 hover:text-text-1"
                >
                  Add
                </button>
              </div>
              {customAllergens.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {customAllergens.map((a) => (
                    <span key={a} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-3 py-1 font-syne text-xs text-text-2">
                      {a}
                      <button type="button" onClick={() => setCustomAllergens((p) => p.filter((x) => x !== a))} className="text-text-3 hover:text-red-400">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="font-syne text-[10px] uppercase tracking-widest text-red-400/80 text-center pt-2">
              Allergy warning: Always verify allergens directly on product packaging.
            </p>
          </Section>

          {/* Avoided Ingredients */}
          <Section title="Avoided Ingredients" onSave={saveAvoided} saving={savingSection === 'avoided'}>
            <div className="flex flex-wrap gap-2">
              {AVOIDED_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addAvoided(s)}
                  disabled={avoided.includes(s)}
                  className={`rounded-full border px-3 py-1.5 font-syne text-xs transition-all ${
                    avoided.includes(s)
                      ? 'border-accent bg-accent text-bg font-semibold'
                      : 'border-border text-text-2 hover:border-text-3 hover:text-text-1'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={avoidedInput}
                onChange={(e) => setAvoidedInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addAvoided(avoidedInput.trim())}
                placeholder="Add ingredient to avoid..."
                className="flex-1 rounded-lg border border-border bg-bg px-4 py-2 font-syne text-sm text-text-1 placeholder:text-text-3 focus:border-accent/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => addAvoided(avoidedInput.trim())}
                className="rounded-lg border border-border px-4 py-2 font-syne text-sm text-text-2 hover:text-text-1"
              >
                Add
              </button>
            </div>
            {avoided.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {avoided.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg px-3 py-1 font-syne text-xs text-text-2">
                    {a}
                    <button type="button" onClick={() => setAvoided((p) => p.filter((x) => x !== a))} className="text-text-3 hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            )}
          </Section>
        </motion.div>
      </main>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  )
}
