import mongoose from 'mongoose'
const { Schema, model } = mongoose

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  healthGoals: [{ type: String }],       // e.g. ['weight_loss','muscle_gain']
  dietaryPreferences: [{ type: String }], // e.g. ['vegetarian','halal']
}, { timestamps: true })

export default model('UserPreferences', schema)
