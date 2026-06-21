import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { Navbar } from '../components/Navbar'
import { ChartIcon, AlertIcon, UploadIcon, EmptySearchIcon } from '../components/Icons'
import api from '../services/api'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
}
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const scoreColor = (s) => {
  if (s >= 7) return '#4ADE80'
  if (s >= 4) return '#F5A524'
  return '#FF4545'
}

const StatCard = ({ label, value, sub, color }) => (
  <motion.div
    variants={cardVariants}
    className="rounded-xl border border-border bg-surface p-5 flex flex-col gap-1"
  >
    <p className="font-syne text-xs text-text-2 uppercase tracking-wider">{label}</p>
    <p className="font-mono text-2xl font-medium" style={{ color: color || '#EDEDED' }}>
      {value}
    </p>
    {sub && <p className="font-syne text-xs text-text-3 truncate">{sub}</p>}
  </motion.div>
)

const ScanCard = ({ scan }) => {
  const navigate = useNavigate()
  const score = Number(scan.healthScore ?? scan.overall_score ?? 0)
  const color = scoreColor(score)
  const date = new Date(scan.createdAt || scan.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2, borderColor: '#2e2e2e' }}
      onClick={() => navigate('/history')}
      className="rounded-xl border border-border bg-surface p-4 flex items-center gap-4 cursor-pointer transition-colors"
    >
      <div
        className="w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 font-mono text-sm font-bold"
        style={{ borderColor: color, color }}
      >
        {score.toFixed(1)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-syne text-sm font-semibold text-text-1 truncate">
          {scan.productName || scan.product_name || 'Unknown product'}
        </p>
        <p className="font-syne text-xs text-text-3">{date}</p>
      </div>
    </motion.div>
  )
}

export const Dashboard = () => {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentScans, setRecentScans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [statsRes, histRes] = await Promise.all([
          api.get('/api/history/stats'),
          api.get('/api/history?limit=5'),
        ])
        setStats(statsRes.data.data || statsRes.data)
        setRecentScans(histRes.data.data?.scans || histRes.data.scans || [])
      } catch {
        // keep empty
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const firstName = user?.name?.split(' ')[0] || 'there'
  const avgScore = stats?.avgScore ? Number(stats.avgScore).toFixed(1) : '—'
  const totalScans = stats?.totalScans ?? '—'
  const bestProduct = stats?.highestScore || stats?.bestProduct
  const worstProduct = stats?.lowestScore || stats?.worstProduct

  return (
    <div className="min-h-screen bg-bg text-text-1">
      <Navbar />
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent mb-2">
            Dashboard
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-text-1">
            {getGreeting()}, {firstName}
          </h1>
          <p className="mt-2 font-syne text-sm text-text-2">
            Here's your nutrition intelligence at a glance.
          </p>
        </motion.div>

        {userProfile && (!userProfile.prefs?.healthGoals?.length && !userProfile.allergy?.commonAllergens?.length) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 rounded-xl border border-accent/40 bg-accent/10 p-5 flex items-start gap-4"
          >
            <span className="text-accent mt-0.5"><AlertIcon className="h-5 w-5" /></span>
            <div>
              <h3 className="font-syne text-sm font-bold text-accent">Complete your profile for better results</h3>
              <p className="mt-1 font-syne text-xs text-text-2">We use your dietary preferences, health goals, and allergies to give you personalized health scores and warnings.</p>
              <Link to="/profile" className="mt-3 inline-block font-syne text-xs font-semibold text-accent hover:underline">Update Profile →</Link>
            </div>
          </motion.div>
        )}

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-10"
        >
          <Link
            to="/scan"
            className="rounded-lg bg-accent px-5 py-2.5 font-syne text-sm font-bold text-bg hover:bg-accent/90 transition-colors"
          >
            Scan a Label →
          </Link>
          <Link
            to="/compare"
            className="rounded-lg border border-border px-5 py-2.5 font-syne text-sm font-semibold text-text-1 hover:border-text-3 transition-colors"
          >
            Compare Products
          </Link>
          <Link
            to="/history"
            className="rounded-lg border border-border px-5 py-2.5 font-syne text-sm font-semibold text-text-2 hover:text-text-1 hover:border-text-3 transition-colors"
          >
            View History
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-10"
        >
          <StatCard label="Total Scans" value={loading ? '...' : totalScans} />
          <StatCard
            label="Avg Score"
            value={loading ? '...' : avgScore}
            color={stats?.avgScore ? scoreColor(stats.avgScore) : undefined}
          />
          <StatCard
            label="Best Product"
            value={loading ? '...' : bestProduct ? `${Number(bestProduct.score).toFixed(1)}` : '—'}
            sub={bestProduct?.productName || bestProduct?.name}
            color="#4ADE80"
          />
          <StatCard
            label="Worst Product"
            value={loading ? '...' : worstProduct ? `${Number(worstProduct.score).toFixed(1)}` : '—'}
            sub={worstProduct?.productName || worstProduct?.name}
            color="#FF4545"
          />
        </motion.div>

        {/* Recent Scans */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-syne text-base font-bold text-text-1">Recent Scans</h2>
            <Link to="/history" className="font-syne text-xs text-text-2 hover:text-accent transition-colors">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recentScans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-dashed border-border p-12 text-center"
            >
              <div className="flex justify-center mb-4 text-text-3">
                <EmptySearchIcon className="h-10 w-10" />
              </div>
              <p className="font-syne text-sm text-text-2">No scans yet.</p>
              <p className="font-syne text-xs text-text-3 mt-1">
                Scan your first product to see insights here.
              </p>
              <Link
                to="/scan"
                className="mt-5 inline-block rounded-lg bg-accent px-5 py-2 font-syne text-sm font-bold text-bg"
              >
                Scan now →
              </Link>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid gap-3 sm:grid-cols-2"
            >
              {recentScans.map((scan) => (
                <ScanCard key={scan._id || scan.id} scan={scan} />
              ))}
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
