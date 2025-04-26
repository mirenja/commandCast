import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const commandSchema = new Schema({
    id: { type: String, required: true, unique: true },
    session_id: {type: String, ref: 'Session', required: true },
    sent_by: { type: Schema.Types.UUID, ref: 'User', required: true },
    client_id: { type: Schema.Types.UUID, ref: 'Client', required: true },
    command_text:{ type: String, required: true },
    command_category: { type: String, required: true },
    },
    { timestamps: true })

export const Command = mongoose.model('Command', commandSchema)