import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const auditLogSchema = new Schema({
    id: { type: Schema.Types.UUID, required: true, unique: true },
    session_id: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
    actor_type: { type: String, required: true }, // "User" created command or  "Device"  joined
    actor_id: { type: Schema.Types.UUID, required: true },
    action: { type: String, required: true }, //command_sent,response_received,device_joined,session_closed,AUTH_FAILURE,CONNECTION_LOST,RATE_LIMIT_TRIGGERED
    meta: { type: Schema.Types.Mixed, required: true }, // For storing data in JSON format
    },
    { timestamps: true })

export const AuditLog = mongoose.model('AuditLog', auditLogSchema)