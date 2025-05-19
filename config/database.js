import mongoose from 'mongoose'
import { MONGODB_URI } from './app.js'

const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('💽 Database connected')
    return mongoose.connection
  } catch (error) {
    console.error('❌ Database connection error:', error)
    throw error
  }
}

export default connectToDatabase