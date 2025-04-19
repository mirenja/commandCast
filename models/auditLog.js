import mongoose from 'mongoose'

const auditLogSchema = new Schema({
    id: { type: Schema.Types.UUID, required: true, unique: true },
    session_id: { type: Schema.Types.UUID, ref: 'Session', required: true },
    actor_type: { type: String, required: true }, // "User" created command or  "Device" joined session
    actor_id: { type: Schema.Types.UUID, required: true },
    action: { type: String, required: true },
    meta: { type: Schema.Types.Mixed, required: true }, // For storing data in JSON format
    created_at: { type: Date, default: Date.now },
    },
    { timestamps: true })

export const AuditLog = mongoose.model('AuditLog', auditLogSchema)