import mongoose from 'mongoose'
const { Schema, model } = mongoose

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  productName: { type: String, default: 'Unknown Product' },
  healthScore: { type: Number },
  goalScores: {
    weight_loss: Number,
    muscle_gain: Number,
    general_health: Number,
    diabetes_friendly: Number,
    heart_health: Number,
  },
  recommendation: { type: String },
  nutritionData: { type: Object },
  ingredientList: [{ type: String }],
  allergyAlerts: [{ type: Object }],
  redFlags: [{ type: Object }],
  imageUrl: { type: String, default: null },
  forYou: { type: Object },
}, { timestamps: true })

schema.index({ userId: 1, createdAt: -1 })
schema.index({ userId: 1, healthScore: -1 })
export default model('ScanHistory', schema)
