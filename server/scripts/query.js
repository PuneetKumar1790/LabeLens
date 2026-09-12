import 'dotenv/config'
import mongoose from 'mongoose'
import ScanHistory from './models/ScanHistory.js'

await mongoose.connect(process.env.MONGODB_URI)
const scans = await ScanHistory.find().sort({createdAt: -1}).limit(2)
console.log(JSON.stringify(scans, null, 2))
process.exit(0)
