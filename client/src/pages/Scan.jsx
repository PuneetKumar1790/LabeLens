import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { UploadZone } from '../components/UploadZone'
import { AnalysisResult } from '../components/AnalysisResult'
import { useAnalyze } from '../hooks/useAnalyze'

export const Scan = () => {
  const [file, setFile] = useState(null)
  const { status, result, error, analyze, reset } = useAnalyze()

  const handleReset = () => {
    setFile(null)
    reset()
  }

  return (
    <div className="min-h-screen bg-bg px-5 py-8 text-text-1 sm:px-8">
      <main className="mx-auto max-w-[720px] pt-10 sm:pt-20">
        <Link to="/" className="font-syne text-[13px] text-text-2 hover:text-text-1">
          ← Back to home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="mt-10"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Live scan</p>
          <h1 className="mt-3 font-serif text-6xl leading-none text-text-1">Upload a label</h1>
          <p className="mt-5 font-syne text-base leading-7 text-text-2">
            Use a clear photo of the nutrition panel and ingredients list.
          </p>
        </motion.div>

        <div className="mt-10">
          <AnimatePresence mode="wait">
            {status === 'success' && result ? (
              <AnalysisResult key="result" result={result} onReset={handleReset} />
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <UploadZone
                  file={file}
                  onFile={setFile}
                  onAnalyze={() => file && analyze(file)}
                  status={status}
                />

                {status === 'error' ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 border border-border bg-surface p-5"
                  >
                    <p className="font-syne text-sm text-text-1">
                      {error || "Couldn't read this label. Try a clearer photo."}
                    </p>
                    <button
                      type="button"
                      onClick={() => file && analyze(file)}
                      className="mt-4 rounded-sm bg-accent px-4 py-2 font-syne text-sm font-bold text-bg"
                    >
                      Retry scan →
                    </button>
                  </motion.div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
