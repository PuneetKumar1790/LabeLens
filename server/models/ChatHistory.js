import mongoose from 'mongoose'
const { Schema, model } = mongoose

const msgSchema = new Schema({
  role: { type: String, enum: ['user', 'assistant'] },
  content: { type: String },
  ts: { type: Date, default: Date.now },
}, { _id: false })

const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  scanId: { type: Schema.Types.ObjectId, ref: 'ScanHistory', default: null },
  messages: [msgSchema],
}, { timestamps: true })

schema.index({ userId: 1, scanId: 1 })
export default model('ChatHistory', schema)
