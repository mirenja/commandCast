import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const clientSchema = new Schema({
    id: { type: Schema.Types.UUID, required: true, unique: true },
    name: { type: String, required: true },
    ip_address: { type: String, required: true },
    status: { type: String, required: true },
    sessions: { type: Schema.Types.UUID, ref: 'Session'},
    },
    { timestamps: true })

export const Client = mongoose.model('Client',clientSchema)