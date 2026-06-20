import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors duration-200 ${
      checked ? 'border-accent bg-accent' : 'border-border bg-bg'
    }`}
  >
    <motion.span
      animate={{ x: checked ? 20 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`inline-block h-4 w-4 rounded-full shadow ${checked ? 'bg-bg' : 'bg-text-3'}`}
    />
  </button>
)

const Toast = ({ message, type = 'success' }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 16 }}
    className={`fixed bottom-6 right-6 z-50 rounded-xl border px-5 py-3 font-syne text-sm shadow-2xl backdrop-blur ${
      type === 'success'
        ? 'border-accent/40 bg-surface text-accent'
        : 'border-red-500/40 bg-surface text-red-400'
    }`}
  >
    {message}
  </motion.div>
)

const SettingsCard = ({ children }) => (
  <div className="rounded-xl border border-border bg-surface overflow-hidden">{children}</div>
)

const SettingsRow = ({ label, description, children }) => (
  <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-border/60 last:border-0">
    <div>
      <p className="font-syne text-sm font-semibold text-text-1">{label}</p>
      {description && <p className="mt-0.5 font-syne text-xs text-text-2 max-w-sm">{description}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>
)

export const Settings = () => {
  const { logout } = useAuth()
  const [saveImages, setSaveImages] = useState(false)
  const [toast, setToast] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [savingToggle, setSavingToggle] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/user/settings')
        const s = res.data.data || res.data
        setSaveImages(s?.saveImages ?? false)
      } catch {
        // silently fail
      }
    }
    load()
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleToggleSaveImages = async (val) => {
    setSaveImages(val)
    setSavingToggle(true)
    try {
      await api.put('/api/user/settings', { saveImages: val })
      showToast(val ? 'Scan images will be saved.' : 'Scan images will not be saved.')
    } catch {
      setSaveImages(!val)
      showToast('Failed to update setting', 'error')
    } finally {
      setSavingToggle(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }
    try {
      await api.delete('/api/user/account')
      logout()
    } catch {
      showToast('Failed to delete account', 'error')
      setDeleteConfirm(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text-1">
      <Navbar />
      <main className="mx-auto max-w-xl px-5 py-10 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent mb-2">Preferences</p>
          <h1 className="font-serif text-4xl text-text-1">Settings</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Privacy */}
          <div>
            <p className="font-syne text-xs text-text-3 uppercase tracking-widest mb-3 px-1">Privacy</p>
            <SettingsCard>
              <SettingsRow
                label="Save scan images to cloud"
                description="When enabled, your label images are stored securely in Azure Blob Storage for scan history."
              >
                <Toggle
                  checked={saveImages}
                  onChange={savingToggle ? undefined : handleToggleSaveImages}
                />
              </SettingsRow>
            </SettingsCard>
          </div>

          {/* Account */}
          <div>
            <p className="font-syne text-xs text-text-3 uppercase tracking-widest mb-3 px-1">Account</p>
            <SettingsCard>
              <SettingsRow
                label="Sign Out"
                description="You'll be signed out of LabelLens on this device."
              >
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 font-syne text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  Sign Out
                </button>
              </SettingsRow>
              <SettingsRow
                label="Delete Account"
                description="Permanently delete your account and all data. This action cannot be undone."
              >
                {deleteConfirm ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(false)}
                      className="font-syne text-xs text-text-2 hover:text-text-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      className="rounded-lg bg-red-600 px-4 py-2 font-syne text-xs font-bold text-white hover:bg-red-700 transition-colors"
                    >
                      Yes, delete
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="rounded-lg border border-red-900/50 bg-red-900/20 px-4 py-2 font-syne text-sm font-semibold text-red-500/80 hover:bg-red-900/30 transition-colors"
                  >
                    Delete Account
                  </button>
                )}
              </SettingsRow>
            </SettingsCard>
          </div>

          {/* About */}
          <div>
            <p className="font-syne text-xs text-text-3 uppercase tracking-widest mb-3 px-1">About</p>
            <SettingsCard>
              <SettingsRow label="App Version">
                <span className="font-mono text-xs text-text-3">v2.0.0</span>
              </SettingsRow>
              <SettingsRow label="Privacy Policy">
                <a
                  href="/privacy"
                  className="font-syne text-xs text-accent hover:underline"
                >
                  View →
                </a>
              </SettingsRow>
              <SettingsRow label="Terms of Service">
                <a
                  href="/terms"
                  className="font-syne text-xs text-accent hover:underline"
                >
                  View →
                </a>
              </SettingsRow>
            </SettingsCard>
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  )
}
