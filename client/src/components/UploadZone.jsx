import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { CameraIcon, ImageIcon, UploadIcon } from './Icons'

const formatSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`

export const UploadZone = ({ file, onFile, onAnalyze, status }) => {
  const [preview, setPreview] = useState(null)
  const cameraInputRef = useRef(null)

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
    noClick: true,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
  })

  const handleCameraFile = (event) => {
    const nextFile = event.target.files?.[0]
    if (nextFile) onFile(nextFile)
    event.target.value = ''
  }

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
            className="h-full w-full scale-105 object-cover blur-[3px] brightness-[0.42]"
          />
          <div className="absolute inset-0 bg-bg/35" />
          <div className="scanline" />
          <div className="absolute inset-0 grid place-items-center px-5">
            <div className="w-full max-w-[300px] rounded-lg border border-accent/25 bg-bg/90 p-6 text-center shadow-2xl shadow-bg/60 backdrop-blur-md">
              <div className="mx-auto h-1.5 w-full max-w-52 overflow-hidden rounded-full bg-border">
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
        <input {...getInputProps({ 'aria-label': 'Choose a food label image from gallery' })} />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handleCameraFile}
          className="sr-only"
          aria-label="Take a food label photo"
        />

        {preview ? (
          <div>
            <div className="absolute right-4 top-4 z-10 flex gap-2 sm:right-6 sm:top-6">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  cameraInputRef.current?.click()
                }}
                className="inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-bg/90 px-3 font-syne text-xs font-semibold text-text-1 backdrop-blur"
              >
                <CameraIcon className="h-4 w-4" />
                Retake
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  open()
                }}
                className="inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-bg/90 px-3 font-syne text-xs font-semibold text-text-1 backdrop-blur"
              >
                <ImageIcon className="h-4 w-4" />
                Change
              </button>
            </div>
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
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    cameraInputRef.current?.click()
                  }}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-accent px-5 font-syne text-sm font-bold text-bg"
                >
                  <CameraIcon />
                  Take photo
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    open()
                  }}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-sm border border-border px-5 font-syne text-sm font-bold text-text-1"
                >
                  <ImageIcon />
                  Choose from gallery
                </button>
              </div>
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
      className="mt-5 font-syne text-sm font-semibold text-text-1"
    >
      {loadingMessages[index]}
    </motion.p>
  )
}
