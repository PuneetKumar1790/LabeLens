import mongoose from 'mongoose'
const { Schema, model } = mongoose

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  avatar: { type: String, default: '' },
  authProvider: { type: String, enum: ['google'], default: 'google' },
  googleId: { type: String, unique: true, sparse: true },
  onboardingCompleted: { type: Boolean, default: false },
  saveImages: { type: Boolean, default: true },
  subscriptionStatus: {
    type: String,
    enum: ['free', 'active', 'past_due', 'cancelled', 'expired'],
    default: 'free',
  },
  subscriptionId: { type: String, default: null },
  customerId: { type: String, default: null },
  orderId: { type: String, default: null },
  variantId: { type: String, default: null },
  renewsAt: { type: Date, default: null },
  endsAt: { type: Date, default: null },
  scansCount: { type: Number, default: 0 },
}, { timestamps: true })

export default model('User', userSchema)
