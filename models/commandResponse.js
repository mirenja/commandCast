import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const commandResponseSchema = new Schema({
    command_id: { type: Schema.Types.ObjectId, ref: 'Command', required: true },
    response_text: { type: String, required: true ,default: null},
    },
    { timestamps: true })

commandResponseSchema.index({ command_id: 1 })

export const CommandResponse = mongoose.model('CommandResponse', commandResponseSchema)