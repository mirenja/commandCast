import mongoose from 'mongoose'

const commandResponseSchema = new Schema({
    id: { type: Schema.Types.UUID, required: true, unique: true },
    command_id: { type: Schema.Types.UUID, ref: 'Command', required: true },
    device_id: { type: Schema.Types.UUID, ref: 'Device', required: true },
    response_text: { type: String, required: true },
    },
    { timestamps: true })

export const CommandResponse = mongoose.model('CommandResponse', commandResponseSchema)