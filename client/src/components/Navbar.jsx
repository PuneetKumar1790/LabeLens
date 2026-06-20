import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Logo } from './Logo'
import { useAuth } from '../contexts/AuthContext'

const links = [
  { label: 'Features', href: '/#features' },
  { label: 'How it works', href: '/#process' },
  { label: 'About', href: '/#about' },
]

export const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3" aria-label="LabelLens home">
          <Logo className="h-10 w-10 shrink-0" />
          <span className="font-syne text-[15px] font-semibold tracking-normal text-text-1">LabelLens</span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-syne text-sm font-normal text-text-2 hover:text-text-1"
            >
              {link.label}
            </a>
          ))}
          {user && (
            <>
              <Link to="/dashboard" className="font-syne text-sm font-normal text-text-2 hover:text-text-1">Dashboard</Link>
              <Link to="/history" className="font-syne text-sm font-normal text-text-2 hover:text-text-1">History</Link>
            </>
          )}
          <Link to="/compare" className="font-syne text-sm font-normal text-text-2 hover:text-text-1">Compare</Link>
          <Link to="/scan" className="font-syne text-sm font-normal text-text-2 hover:text-text-1">Scan</Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full focus:outline-none"
                onClick={() => setDropdownOpen((v) => !v)}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="h-9 w-9 rounded-full border border-border object-cover" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-bg font-bold font-syne">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-border bg-surface shadow-xl"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-syne text-text-1 truncate">{user.name}</p>
                        <p className="text-xs font-mono text-text-2 truncate mt-1">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm font-syne text-text-2 hover:bg-border hover:text-text-1">Dashboard</Link>
                        <Link to="/history" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm font-syne text-text-2 hover:bg-border hover:text-text-1">History</Link>
                        <Link to="/profile" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm font-syne text-text-2 hover:bg-border hover:text-text-1">Profile</Link>
                        <Link to="/settings" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm font-syne text-text-2 hover:bg-border hover:text-text-1">Settings</Link>
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm font-syne text-red hover:bg-border">Sign Out</button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-md bg-accent px-4 py-2 font-syne text-[13px] font-semibold text-bg sm:inline-flex"
            >
              Sign In →
            </Link>
          )}

          <button
            type="button"
            className="grid h-9 w-9 place-items-center border border-border bg-bg text-text-1 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Open navigation"
            aria-expanded={open}
          >
            <span className="font-mono text-sm">{open ? 'x' : '='}</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.24 }}
            className="border-b border-border bg-bg px-5 py-4 md:hidden"
          >
            <div className="grid gap-3">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-border/70 py-3 font-syne text-sm text-text-2"
                >
                  {link.label}
                </a>
              ))}
              <Link to="/compare" onClick={() => setOpen(false)} className="border-b border-border/70 py-3 font-syne text-sm text-text-2">Compare</Link>
              <Link to="/scan" onClick={() => setOpen(false)} className="border-b border-border/70 py-3 font-syne text-sm text-text-2">Scan</Link>
              {user && (
                <>
                  <Link to="/dashboard" onClick={() => setOpen(false)} className="border-b border-border/70 py-3 font-syne text-sm text-text-2">Dashboard</Link>
                  <Link to="/history" onClick={() => setOpen(false)} className="border-b border-border/70 py-3 font-syne text-sm text-text-2">History</Link>
                  <Link to="/profile" onClick={() => setOpen(false)} className="border-b border-border/70 py-3 font-syne text-sm text-text-2">Profile</Link>
                  <Link to="/settings" onClick={() => setOpen(false)} className="border-b border-border/70 py-3 font-syne text-sm text-text-2">Settings</Link>
                  <button onClick={() => { handleLogout(); setOpen(false); }} className="text-left border-b border-border/70 py-3 font-syne text-sm text-red">Sign Out</button>
                </>
              )}
              {!user && (
                <Link to="/login" onClick={() => setOpen(false)} className="border-b border-border/70 py-3 font-syne text-sm font-semibold text-accent">Sign In →</Link>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
