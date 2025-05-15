import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const clientSchema = new Schema({
    id: { type: Schema.Types.UUID, required: true, unique: true },
    name: { type: String, required: true }, //reinforce unique name.
    mac_address : { type: String, required: true },
    ip_address: { type: String, required: true },
    status:{ type: String, enum: ['online', 'offline', 'unknown'], default: 'unknown' },
    //whats best practise ?
    sessions: { type: [Schema.Types.ObjectId], ref: 'Session' ,default: [],}
    },
    { timestamps: true })


clientSchema.index({ sessions: 1 })

export const Client = mongoose.model('Client',clientSchema)