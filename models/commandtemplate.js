import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const commandTemplateSchema = new Schema({
    id: { type: Schema.Types.UUID, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    created_by: { type: Schema.Types.UUID, ref: 'User', required: true },
    },
    { timestamps: true })

export const CommandTemplate = mongoose.model('CommandTemplate', commandTemplateSchema)