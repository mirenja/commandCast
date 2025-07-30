import mongoose from 'mongoose'
import { MONGODB_URI } from './app.js'

const connectToDatabase = async () => {
  try {
    const connection = await mongoose.connect(MONGODB_URI)
    console.log('💽 Database connected')
    console.log('📡 Connected to DB:', connection.connection.name)
    return mongoose.connection
  } catch (error) {
    console.error('❌ Database connection error:', error)
    throw error
  }
}

export default connectToDatabase