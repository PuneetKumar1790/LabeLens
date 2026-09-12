import mongoose from 'mongoose'

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI

  if (!uri || uri.trim() === '' || uri.includes('<db_password>')) {
    console.error('❌ MONGODB_URI is not set or contains placeholder text in .env.')
    console.error('Please configure a valid MongoDB connection string in server/.env (e.g. mongodb+srv://... or mongodb://localhost:27017/labellens).')
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
    return
  }

  try {
    await mongoose.connect(uri)
    console.log('✅ MongoDB connected successfully')
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message)
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }
}
