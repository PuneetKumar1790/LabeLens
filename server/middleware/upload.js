import multer from 'multer'

const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.mimetype)) {
      const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE')
      err.message = 'Unsupported file type. Please upload a JPEG, PNG, or WebP image.'
      return cb(err)
    }
    cb(null, true)
  },
})
