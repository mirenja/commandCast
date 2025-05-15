import mongoose from 'mongoose'
import { Schema } from 'mongoose'

// One session can involve multiple devices
const sessionSchema = new mongoose.Schema({
    session_id: { type: String, required: true },
    started_by : { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clients: [{ type: Schema.Types.ObjectId, ref: 'Client',default: []}],
   
    },
    { timestamps: true })

sessionSchema.index({ session_id: 1 })
sessionSchema.index({ started_by: 1 })

export const Session = mongoose.model('Session', sessionSchema)



