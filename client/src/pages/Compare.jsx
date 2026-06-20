import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Navbar } from '../components/Navbar'
import { CameraIcon } from '../components/Icons'
import api from '../services/api'

const COMPARISON_FIELDS = [
  { key: 'protein', label: 'Protein' },
  { key: 'sugar', label: 'Sugar' },
  { key: 'fiber', label: 'Fiber' },
  { key: 'sodium', label: 'Sodium' },
  { key: 'additives', label: 'Additives Level' },
  { key: 'overall_score', label: 'Overall Score' },
]

const GOAL_LABELS = [
  'Weight Loss',
  'Muscle Gain',
  'General Health',
  'Diabetes Friendly',
  'Heart Health',
]

const levelColor = (level) => {
  if (!level) return 'text-text-2'
  const l = String(level).toLowerCase()
  if (l === 'low' || l === 'high protein' || l === 'high fiber') return 'text-green-400'
  if (l === 'medium' || l === 'medium protein') return 'text-amber-400'
  if (l === 'high' || l === 'high sugar' || l === 'high sodium' || l === 'high additives') return 'text-red-400'
  return 'text-text-2'
}

const DropZone = ({ label, file, onFile, onRemove }) => {
  const [preview, setPreview] = useState(null)

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles[0]) {
        const f = acceptedFiles[0]
        onFile(f)
        const url = URL.createObjectURL(f)
        setPreview(url)
      }
    },
    [onFile]
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 5 * 1024 * 1024,
    noClick: true,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
  })

  return (
    <div className="flex-1 min-w-0">
      <p className="font-syne text-sm font-semibold text-text-1 mb-3">{label}</p>
      <div
        {...getRootProps()}
        className={`relative rounded-xl border-2 border-dashed transition-all ${
          isDragActive ? 'border-accent bg-accent/5' : 'border-border'
        } ${file ? 'p-3' : 'p-8'}`}
      >
        <input {...getInputProps()} />
        {preview && file ? (
          <div className="relative">
            <img
              src={preview}
              alt={label}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                  setPreview(null)
                }}
                className="rounded-lg border border-border bg-bg/90 px-3 py-1 font-syne text-xs text-text-2 hover:text-red-400 transition-colors backdrop-blur"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); open() }}
                className="rounded-lg border border-border bg-bg/90 px-3 py-1 font-syne text-xs text-text-2 hover:text-text-1 transition-colors backdrop-blur"
              >
                Change
              </button>
            </div>
          </div>
        ) : (
          <div className="grid min-h-[180px] place-items-center text-center">
            <div>
              <CameraIcon className="mx-auto h-12 w-12 text-text-3 mb-4" />
              <p className="font-syne text-sm text-text-2 mb-4">
                {isDragActive ? 'Release to upload' : 'Drop image here'}
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); open() }}
                className="rounded-lg border border-border px-4 py-2 font-syne text-xs font-semibold text-text-1 hover:border-text-3 transition-colors"
              >
                Choose file
              </button>
              <p className="mt-3 font-mono text-[10px] text-text-3">JPG · PNG · WEBP · up to 5 MB</p>
            </div>
          </div>
        )}
      </div>
      {file && (
        <p className="mt-2 font-mono text-xs text-text-3 truncate">{file.name}</p>
      )}
    </div>
  )
}

const getFieldValue = (result, key) => {
  if (key === 'overall_score') return result?.overall_score ? `${Number(result.overall_score).toFixed(1)}/10` : '—'
  const breakdown = result?.breakdown?.[key]
  if (!breakdown) return '—'
  return `${breakdown.level || '—'}`
}

export const Compare = () => {
  const [fileA, setFileA] = useState(null)
  const [fileB, setFileB] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)

  const canCompare = fileA && fileB && !loading

  const handleCompare = async () => {
    if (!canCompare) return
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const formData = new FormData()
      formData.append('labelA', fileA)
      formData.append('labelB', fileB)
      const res = await api.post('/api/compare', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResults(res.data.data || res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Comparison failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFileA(null)
    setFileB(null)
    setResults(null)
    setError(null)
  }

  const productA = results?.productA || results?.a
  const productB = results?.productB || results?.b
  const winner = results?.winner
  const goalWinners = results?.goalWinners || results?.goal_winners || {}

  return (
    <div className="min-h-screen bg-bg text-text-1">
      <Navbar />
      <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent mb-2">
            Compare
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-text-1">Compare Products</h1>
          <p className="mt-3 font-syne text-sm text-text-2">
            Upload two product labels to get a side-by-side nutrition comparison.
          </p>
        </motion.div>

        {/* Upload zones */}
        <AnimatePresence mode="wait">
          {!results ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row gap-6">
                <DropZone
                  label="Product A"
                  file={fileA}
                  onFile={setFileA}
                  onRemove={() => setFileA(null)}
                />
                <div className="flex items-center justify-center shrink-0">
                  <span className="font-syne text-text-3 text-lg font-bold">VS</span>
                </div>
                <DropZone
                  label="Product B"
                  file={fileB}
                  onFile={setFileB}
                  onRemove={() => setFileB(null)}
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center font-syne text-sm text-red-400"
                >
                  {error}
                </motion.p>
              )}

              <div className="flex justify-center">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCompare}
                  disabled={!canCompare}
                  className="rounded-xl bg-accent px-10 py-3.5 font-syne text-base font-bold text-bg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </span>
                  ) : (
                    'Compare Labels →'
                  )}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="space-y-8"
            >
              {/* Product headers */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-xl border border-border bg-surface p-4">
                  <p className="font-syne text-xs text-text-3 mb-1">Product A</p>
                  <p className="font-syne text-sm font-bold text-text-1 truncate">
                    {productA?.product_name || 'Product A'}
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <span className="font-syne text-lg font-bold text-text-3">VS</span>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4">
                  <p className="font-syne text-xs text-text-3 mb-1">Product B</p>
                  <p className="font-syne text-sm font-bold text-text-1 truncate">
                    {productB?.product_name || 'Product B'}
                  </p>
                </div>
              </div>

              {/* Comparison table */}
              <div className="rounded-xl border border-border bg-surface overflow-hidden">
                <div className="grid grid-cols-3 border-b border-border bg-bg/50 px-5 py-3">
                  <p className="font-syne text-xs text-text-3 uppercase tracking-wider">Nutrient</p>
                  <p className="text-center font-syne text-xs text-text-3 uppercase tracking-wider">Product A</p>
                  <p className="text-center font-syne text-xs text-text-3 uppercase tracking-wider">Product B</p>
                </div>
                {COMPARISON_FIELDS.map((field, i) => {
                  const valA = getFieldValue(productA, field.key)
                  const valB = getFieldValue(productB, field.key)
                  return (
                    <motion.div
                      key={field.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.35 }}
                      className="grid grid-cols-3 px-5 py-4 border-b border-border/50 last:border-0"
                    >
                      <p className="font-syne text-sm text-text-2">{field.label}</p>
                      <p className={`text-center font-mono text-sm font-semibold ${levelColor(valA)}`}>{valA}</p>
                      <p className={`text-center font-mono text-sm font-semibold ${levelColor(valB)}`}>{valB}</p>
                    </motion.div>
                  )
                })}
              </div>

              {/* Goal winners */}
              {Object.keys(goalWinners).length > 0 && (
                <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent mb-4">
                    Goal Winners
                  </p>
                  {GOAL_LABELS.map((goal, i) => {
                    const w = goalWinners[goal] || goalWinners[goal.toLowerCase().replace(/\s/g, '_')]
                    if (!w) return null
                    return (
                      <motion.div
                        key={goal}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center justify-between"
                      >
                        <span className="font-syne text-sm text-text-2">{goal}</span>
                        <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-syne text-xs font-semibold text-accent">
                          Best: {w}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Overall winner */}
              {winner && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="rounded-xl border border-accent/30 bg-accent/5 p-8 text-center"
                >
                  <p className="font-syne text-xs text-text-2 uppercase tracking-widest mb-2">
                    Overall Winner
                  </p>
                  <p className="font-serif text-4xl text-accent">{winner}</p>
                  {results?.winner_reason && (
                    <p className="mt-3 font-syne text-sm text-text-2">{results.winner_reason}</p>
                  )}
                </motion.div>
              )}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-border px-8 py-3 font-syne text-sm font-semibold text-text-1 hover:border-text-3 transition-colors"
                >
                  Compare Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
