import mongoose from 'mongoose'
const { Schema, model } = mongoose

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  ingredients: [{ type: String }], // e.g. ['palm oil','aspartame']
}, { timestamps: true })

export default model('AvoidedIngredients', schema)
