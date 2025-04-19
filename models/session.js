import mongoose from 'mongoose'

const sessionSchema = new mongoose.Schema({
    id : { type: Schema.Types.UUID, required: true, unique: true },
    session_id: { type: String, required: true },
    started_by : { type: Schema.Types.UUID, ref: 'User', required: true },
    clients: { type: Schema.Types.UUID, ref: 'Client'},
    password : String,
    role : String,
    },
    { timestamps: true })

export const session = mongoose.model('User', sessionSchema)