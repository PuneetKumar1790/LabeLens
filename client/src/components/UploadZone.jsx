import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { UploadIcon } from './Icons'

const formatSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

export const UploadZone = ({ file, onFile, onAnalyze, status }) => {
  const [preview, setPreview] = useState(null)

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles[0]) onFile(acceptedFiles[0])
    },
    [onFile],
  )

  const { getRootProps, getInputProps, isDragActive, open, fileRejections } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 5 * 1024 * 1024,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
  })

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return undefined
    }

    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  if (status === 'loading' && preview) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-xl border border-border bg-surface"
      >
        <div className="relative h-[360px] overflow-hidden">
          <img
            src={preview}
            alt="Uploaded food label"
            className="h-full w-full object-cover blur-sm brightness-[0.6]"
          />
          <div className="scanline" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="w-64 text-center">
              <div className="mx-auto h-1 w-48 overflow-hidden rounded-full bg-border">
                <motion.div
                  className="h-full bg-accent"
                  animate={{ x: ['-100%', '140%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                />
              </div>
              <LoadingText />
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={clsx(
          'relative cursor-pointer rounded-xl border-2 border-dashed border-border p-8 outline-none sm:p-16',
          isDragActive && 'border-accent bg-accent/5',
          file && 'p-4 sm:p-4',
        )}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                open()
              }}
              className="absolute right-6 top-6 z-10 rounded-sm border border-border bg-bg/85 px-3 py-2 font-syne text-xs font-semibold text-text-1 backdrop-blur"
            >
              Change image
            </button>
            <img
              src={preview}
              alt="Uploaded food label"
              className="h-[360px] w-full rounded-lg object-cover"
            />
          </div>
        ) : (
          <div className="grid min-h-[260px] place-items-center text-center">
            <div>
              <UploadIcon className="mx-auto h-8 w-8 text-text-3" />
              <p className="mt-7 font-syne text-lg font-semibold text-text-1">
                {isDragActive ? 'Release to upload' : 'Drop your label here'}
              </p>
              <p className="mt-2 font-syne text-sm text-text-3">or click to browse</p>
              <p className="mt-8 font-mono text-xs text-text-3">JPG · PNG · WEBP · up to 5 MB</p>
            </div>
          </div>
        )}
      </div>

      {file ? (
        <div className="mt-4 flex items-center justify-between gap-4 font-mono text-xs text-text-2">
          <span className="truncate">{file.name}</span>
          <span>{formatSize(file.size)}</span>
        </div>
      ) : null}

      {fileRejections[0] ? (
        <p className="mt-4 font-syne text-sm text-score-bad">
          Use a JPG, PNG, or WEBP image under 5 MB.
        </p>
      ) : null}

      {file ? (
        <button
          type="button"
          onClick={onAnalyze}
          className="mt-8 w-full rounded-sm bg-accent py-4 font-syne text-base font-bold text-bg"
        >
          Analyze label →
        </button>
      ) : null}
    </div>
  )
}

const loadingMessages = ['Reading label...', 'Identifying ingredients...', 'Calculating score...']

const LoadingText = () => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((value) => Math.min(value + 1, loadingMessages.length - 1))
    }, 1500)
    return () => window.clearInterval(id)
  }, [])

  return (
    <motion.p
      key={loadingMessages[index]}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="mt-6 font-mono text-[13px] text-text-2"
    >
      {loadingMessages[index]}
    </motion.p>
  )
}
