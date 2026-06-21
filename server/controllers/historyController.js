import ScanHistory from '../models/ScanHistory.js'
import mongoose from 'mongoose'

// ---------------------------------------------------------------------------
// GET /api/history
// Paginated scan history with filtering and sorting
// ---------------------------------------------------------------------------
export const getHistory = async (req, res) => {
  try {
    const userId = req.user._id
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
    const skip = (page - 1) * limit
    const sortBy = ['createdAt', 'healthScore'].includes(req.query.sortBy)
      ? req.query.sortBy
      : 'createdAt'
    const sortDir = req.query.sortDir === 'asc' ? 1 : -1
    const search = req.query.search ? String(req.query.search).trim() : null
    const minScore = req.query.minScore !== undefined ? parseFloat(req.query.minScore) : null
    const maxScore = req.query.maxScore !== undefined ? parseFloat(req.query.maxScore) : null

    const filter = { userId }

    if (search) {
      filter.productName = { $regex: search, $options: 'i' }
    }

    if (minScore !== null || maxScore !== null) {
      filter.healthScore = {}
      if (minScore !== null) filter.healthScore.$gte = minScore
      if (maxScore !== null) filter.healthScore.$lte = maxScore
    }

    const [scans, total] = await Promise.all([
      ScanHistory.find(filter)
        .sort({ [sortBy]: sortDir })
        .skip(skip)
        .limit(limit)
        .lean(),
      ScanHistory.countDocuments(filter),
    ])

    res.json({
      success: true,
      data: {
        scans,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ---------------------------------------------------------------------------
// GET /api/history/stats
// Dashboard statistics for authenticated user
// ---------------------------------------------------------------------------
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id

    const [totalScans, scoreAgg, highestDoc, lowestDoc, redFlagAgg] = await Promise.all([
      // Total scans
      ScanHistory.countDocuments({ userId }),

      // Average score
      ScanHistory.aggregate([
        { $match: { userId } },
        { $group: { _id: null, avgScore: { $avg: '$healthScore' } } },
      ]),

      // Highest scored product
      ScanHistory.findOne({ userId, healthScore: { $exists: true, $ne: null } })
        .sort({ healthScore: -1 })
        .select('productName healthScore createdAt')
        .lean(),

      // Lowest scored product
      ScanHistory.findOne({ userId, healthScore: { $exists: true, $ne: null } })
        .sort({ healthScore: 1 })
        .select('productName healthScore createdAt')
        .lean(),

      // Most common red flag
      ScanHistory.aggregate([
        { $match: { userId, redFlags: { $exists: true, $not: { $size: 0 } } } },
        { $unwind: '$redFlags' },
        { $group: { _id: '$redFlags.label', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
    ])

    const avgScore =
      scoreAgg.length > 0
        ? Number((scoreAgg[0].avgScore || 0).toFixed(1))
        : null

    const mostCommonRedFlag =
      redFlagAgg.length > 0
        ? { label: redFlagAgg[0]._id, count: redFlagAgg[0].count }
        : null

    res.json({
      success: true,
      data: {
        totalScans,
        avgScore,
        highestScore: highestDoc
          ? { productName: highestDoc.productName, score: highestDoc.healthScore }
          : null,
        lowestScore: lowestDoc
          ? { productName: lowestDoc.productName, score: lowestDoc.healthScore }
          : null,
        mostCommonRedFlag,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ---------------------------------------------------------------------------
// GET /api/history/:id
// Single scan with ownership check
// ---------------------------------------------------------------------------
export const getScan = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid scan ID' })
    }

    const scan = await ScanHistory.findById(id).lean()
    if (!scan) return res.status(404).json({ error: 'Scan not found' })

    // Ownership: userId on scan must match authenticated user
    if (!scan.userId || scan.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    res.json({ success: true, data: scan })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/history/:id
// Delete scan with ownership check
// ---------------------------------------------------------------------------
export const deleteScan = async (req, res) => {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid scan ID' })
    }

    const scan = await ScanHistory.findById(id).lean()
    if (!scan) return res.status(404).json({ error: 'Scan not found' })

    if (!scan.userId || scan.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    // Optionally delete blob if imageUrl exists
    if (scan.imageUrl) {
      try {
        const { deleteImage } = await import('../services/blobStorageService.js')
        await deleteImage(scan.imageUrl)
      } catch (blobErr) {
        console.error('Blob delete failed (non-fatal):', blobErr.message)
      }
    }

    await ScanHistory.findByIdAndDelete(id)
    res.json({ success: true, message: 'Scan deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// ---------------------------------------------------------------------------
// GET /api/history/summary
// Consolidated stats and recent history for authenticated user
// ---------------------------------------------------------------------------
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id

    const [totalScans, scoreAgg, highestDoc, lowestDoc, redFlagAgg, recentScans] = await Promise.all([
      // Total scans
      ScanHistory.countDocuments({ userId }),

      // Average score
      ScanHistory.aggregate([
        { $match: { userId } },
        { $group: { _id: null, avgScore: { $avg: '$healthScore' } } },
      ]),

      // Highest scored product
      ScanHistory.findOne({ userId, healthScore: { $exists: true, $ne: null } })
        .sort({ healthScore: -1 })
        .select('productName healthScore createdAt')
        .lean(),

      // Lowest scored product
      ScanHistory.findOne({ userId, healthScore: { $exists: true, $ne: null } })
        .sort({ healthScore: 1 })
        .select('productName healthScore createdAt')
        .lean(),

      // Most common red flag
      ScanHistory.aggregate([
        { $match: { userId, redFlags: { $exists: true, $not: { $size: 0 } } } },
        { $unwind: '$redFlags' },
        { $group: { _id: '$redFlags.label', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),

      // Recent scans (limit 5)
      ScanHistory.find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ])

    const avgScore =
      scoreAgg.length > 0
        ? Number((scoreAgg[0].avgScore || 0).toFixed(1))
        : null

    const mostCommonRedFlag =
      redFlagAgg.length > 0
        ? { label: redFlagAgg[0]._id, count: redFlagAgg[0].count }
        : null

    res.json({
      success: true,
      data: {
        stats: {
          totalScans,
          avgScore,
          highestScore: highestDoc
            ? { productName: highestDoc.productName, score: highestDoc.healthScore }
            : null,
          lowestScore: lowestDoc
            ? { productName: lowestDoc.productName, score: lowestDoc.healthScore }
            : null,
          mostCommonRedFlag,
        },
        recentScans,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

