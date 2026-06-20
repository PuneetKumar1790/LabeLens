import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Navbar } from '../components/Navbar'
import { AnalysisResult } from '../components/AnalysisResult'
import api from '../services/api'

export const ScanDetail = () => {
  const { id } = useParams()
  const [scan, setScan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchScan = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/api/history/${id}`)
        const rawScan = res.data.data
        // Map ScanHistory model back to AnalysisResult expected shape
        const mappedScan = {
          ...rawScan,
          overall_score: rawScan.healthScore,
          product_name: rawScan.productName || rawScan.product_name,
          breakdown: rawScan.nutritionData,
          ingredients: rawScan.ingredientList || rawScan.ingredients || [],
          allergy_alerts: rawScan.allergyAlerts,
          red_flags: rawScan.redFlags || rawScan.red_flags || [],
          for_you: rawScan.forYou,
          goal_scores: rawScan.goalScores || rawScan.goal_scores,
          positives: rawScan.positives || [],
          negatives: rawScan.negatives || [],
          verdict: rawScan.verdict || rawScan.recommendation || 'No verdict recorded.',
          recommendation: rawScan.recommendation || '',
          score_factors: rawScan.score_factors || { positives: [], negatives: [] }
        }

        setScan(mappedScan)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load scan details.')
      } finally {
        setLoading(false)
      }
    }
    fetchScan()
  }, [id])

  return (
    <div className="min-h-screen bg-bg text-text-1">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        <Link
          to="/history"
          className="mb-6 inline-block font-syne text-sm font-semibold text-text-2 hover:text-accent transition-colors"
        >
          ← Back to History
        </Link>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-400">
            <p className="font-syne text-sm font-semibold">{error}</p>
          </div>
        ) : scan ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {scan.imageUrl && (
              <div className="mb-8 flex justify-center">
                <img 
                  src={scan.imageUrl} 
                  alt={scan.product_name} 
                  className="h-48 w-48 object-cover rounded-xl border border-border"
                />
              </div>
            )}
            <AnalysisResult result={scan} onReset={() => window.location.href = '/scan'} />
          </motion.div>
        ) : null}
      </main>
    </div>
  )
}
