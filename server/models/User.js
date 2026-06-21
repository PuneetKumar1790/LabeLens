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
}, { timestamps: true })

userSchema.index({ email: 1 })
export default model('User', userSchema)
