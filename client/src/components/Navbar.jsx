import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Logo } from './Logo'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#process' },
  { label: 'About', href: '#about' },
]

export const Navbar = () => {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 max-w-[100vw] overflow-x-hidden border-b border-border bg-bg/80 backdrop-blur-md">
      <nav className="relative mx-auto flex h-14 w-[100vw] max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3" aria-label="LabelLens home">
          <Logo className="h-10 w-10 shrink-0" />
          <span className="font-syne text-[15px] font-semibold tracking-normal text-text-1">LabelLens</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-syne text-sm font-normal text-text-2 hover:text-text-1"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="absolute right-4 top-1/2 flex shrink-0 -translate-y-1/2 items-center gap-2 sm:right-8 sm:gap-3">
          <Link
            to="/scan"
            className="hidden rounded-md bg-accent px-4 py-2 font-syne text-[13px] font-semibold text-bg sm:inline-flex"
          >
            Scan a Label →
          </Link>
          <button
            type="button"
            className="fixed right-4 top-2.5 grid h-9 w-9 place-items-center border border-border bg-bg text-text-1 md:hidden"
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
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
