import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const commandSchema = new Schema({
    session_id: {type: String, ref: 'Session', required: true },
    sent_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    client_id: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    command_text:{ type: String, required: true },
    command_category: { type: String, required: true },
    },
    { timestamps: true })

commandSchema.index({ session_id: 1 })
commandSchema.index({ client_id: 1 })
commandSchema.index({ sent_by: 1 })

export const Command = mongoose.model('Command', commandSchema)