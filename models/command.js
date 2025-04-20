import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const commandSchema = new Schema({
    id: { type: Schema.Types.UUID, required: true, unique: true },
    session_id: { type: Schema.Types.UUID, ref: 'Session', required: true },
    sent_by: { type: Schema.Types.UUID, ref: 'User', required: true },
    command_template_id: { type: Schema.Types.UUID, ref: 'CommandTemplate', required: true },
    parameters: { type: String, required: true },
    },
    { timestamps: true })

export const Command = mongoose.model('Command', commandSchema)