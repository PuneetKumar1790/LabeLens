import mongoose from 'mongoose'
const { Schema, model } = mongoose

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  commonAllergens: [{ type: String }], // e.g. ['peanuts','milk','gluten']
  customAllergens: [{ type: String }], // e.g. ['mustard','corn']
}, { timestamps: true })

export default model('AllergyProfile', schema)
