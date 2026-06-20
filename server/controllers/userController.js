import UserPreferences from '../models/UserPreferences.js'
import AllergyProfile from '../models/AllergyProfile.js'
import AvoidedIngredients from '../models/AvoidedIngredients.js'
import User from '../models/User.js'

export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id
    const [prefs, allergy, avoided] = await Promise.all([
      UserPreferences.findOne({ userId }).lean(),
      AllergyProfile.findOne({ userId }).lean(),
      AvoidedIngredients.findOne({ userId }).lean(),
    ])
    res.json({ success: true, data: { user: req.user, prefs, allergy, avoided } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const updatePreferences = async (req, res) => {
  try {
    const { healthGoals, dietaryPreferences } = req.body
    const prefs = await UserPreferences.findOneAndUpdate(
      { userId: req.user._id },
      { healthGoals, dietaryPreferences },
      { upsert: true, new: true }
    )
    res.json({ success: true, data: prefs })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const updateAllergyProfile = async (req, res) => {
  try {
    const { commonAllergens, customAllergens } = req.body
    const profile = await AllergyProfile.findOneAndUpdate(
      { userId: req.user._id },
      { commonAllergens, customAllergens },
      { upsert: true, new: true }
    )
    res.json({ success: true, data: profile })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const updateAvoidedIngredients = async (req, res) => {
  try {
    const { ingredients } = req.body
    const doc = await AvoidedIngredients.findOneAndUpdate(
      { userId: req.user._id },
      { ingredients },
      { upsert: true, new: true }
    )
    res.json({ success: true, data: doc })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const updateSettings = async (req, res) => {
  try {
    const { saveImages, onboardingCompleted } = req.body
    const update = {}
    if (saveImages !== undefined) update.saveImages = saveImages
    if (onboardingCompleted !== undefined) update.onboardingCompleted = onboardingCompleted
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).lean()
    res.json({ success: true, data: user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
