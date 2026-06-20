import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '../components/Navbar'
import { EmptyHistoryIcon, ChartIcon } from '../components/Icons'
import api from '../services/api'

const scoreColor = (s) => {
  if (s >= 7) return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' }
  if (s >= 4) return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' }
  return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const ScanCard = ({ scan, onDelete }) => {
  const navigate = useNavigate()
  const score = Number(scan.healthScore ?? scan.overall_score ?? 0)
  const { bg, text, border } = scoreColor(score)
  const date = new Date(scan.createdAt || scan.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const [confirming, setConfirming] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirming) {
      setConfirming(true)
      return
    }
    try {
      await api.delete(`/api/history/${scan._id || scan.id}`)
      onDelete(scan._id || scan.id)
    } catch {
      setConfirming(false)
    }
  }

  return (
    <motion.div
      variants={cardVariants}
      layout
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2, borderColor: '#2e2e2e' }}
      onClick={() => navigate(`/history/${scan._id || scan.id}`)}
      className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-4 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-syne text-sm font-semibold text-text-1 truncate">
            {scan.productName || scan.product_name || 'Unknown product'}
          </p>
          <p className="font-syne text-xs text-text-3 mt-0.5">{date}</p>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 font-mono text-xs font-semibold ${bg} ${text} ${border}`}
        >
          {score.toFixed(1)}/10
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="font-syne text-xs font-medium text-text-2">
          {scan.redFlags?.length || scan.red_flags?.length || 0} red flags
        </span>
        <button
          type="button"
          onClick={handleDelete}
          className={`rounded-sm px-3 py-1.5 font-syne text-xs font-semibold transition-colors ${
            confirming
              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
              : 'bg-transparent text-text-3 hover:text-red-400'
          }`}
        >
          {confirming ? 'Sure?' : 'Delete'}
        </button>
      </div>
    </motion.div>
  )
}

export const History = () => {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const PER_PAGE = 10

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/history', {
        params: { limit: PER_PAGE, page, sort: sortBy, search },
      })
      const data = res.data.data || res.data
      setScans(data.scans || data || [])
      const total = data.total || (data.scans || data || []).length
      setTotalPages(Math.max(1, Math.ceil(total / PER_PAGE)))
    } catch {
      setScans([])
    } finally {
      setLoading(false)
    }
  }, [page, sortBy, search])

  useEffect(() => {
    const id = setTimeout(fetchHistory, 300)
    return () => clearTimeout(id)
  }, [fetchHistory])

  const handleDelete = (id) => {
    setScans((prev) => prev.filter((s) => (s._id || s.id) !== id))
  }

  return (
    <div className="min-h-screen bg-bg text-text-1">
      <Navbar />
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent mb-2">Scan history</p>
          <h1 className="font-serif text-4xl text-text-1">Your Scans</h1>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search products..."
            className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 font-syne text-sm text-text-1 placeholder:text-text-3 focus:border-accent/50 focus:outline-none transition-colors"
          />
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
            className="rounded-lg border border-border bg-surface px-4 py-2.5 font-syne text-sm text-text-1 focus:border-accent/50 focus:outline-none transition-colors"
          >
            <option value="date">Sort by Date</option>
            <option value="score_high">Score: High to Low</option>
            <option value="score_low">Score: Low to High</option>
          </select>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : scans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-dashed border-border p-16 text-center"
          >
            <div className="flex justify-center mb-4 text-text-3">
              <EmptyHistoryIcon className="h-12 w-12" />
            </div>
            <p className="font-syne text-sm text-text-2">No scans found.</p>
            <p className="font-syne text-xs text-text-3 mt-1">Try adjusting your filters or scanning a new product.</p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-4 font-syne text-xs text-accent hover:underline"
              >
                Clear search
              </button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.07 } } }}
              className="grid gap-4 sm:grid-cols-2"
            >
              {scans.map((scan) => (
                <ScanCard key={scan._id || scan.id} scan={scan} onDelete={handleDelete} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex items-center justify-center gap-2"
          >
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-border px-4 py-2 font-syne text-sm text-text-2 hover:text-text-1 disabled:opacity-40 transition-colors"
            >
              ← Prev
            </button>
            <span className="font-syne text-sm text-text-2">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-border px-4 py-2 font-syne text-sm text-text-2 hover:text-text-1 disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </motion.div>
        )}
      </main>
    </div>
  )
}
