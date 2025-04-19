import express from 'express'
import mongoose from 'mongoose'
import { randomUUID } from 'crypto'

const app =express()
const PORT = 4000


mongoose.connect('mongodb://127.0.0.1:27017/commandcast')
  .then(() => console.log('💽 Database connected'))
  .catch(error => console.error(error))

//schemas

const userSchema = new mongoose.Schema({
    id : {type: Schema.Types.UUID, required: true, unique: true},
    name:  { type: String, required: true ,unique: true},
    email : { type: String, required: true ,unique: true},
    password : { type: String, required: true ,unique: true},
    role : String,
    },
    { timestamps: true })

const sessionSchema = new mongoose.Schema({
    id : { type: Schema.Types.UUID, required: true, unique: true },
    session_id: { type: String, required: true },
    started_by : { type: Schema.Types.UUID, ref: 'User', required: true },
    password : String,
    role : String,
    },
    { timestamps: true })

const clientSchema = new Schema({
    id: { type: Schema.Types.UUID, required: true, unique: true },
    name: { type: String, required: true },
    ip_address: { type: String, required: true },
    status: { type: String, required: true },
    },
    { timestamps: true })

const sessionClientSchema = new Schema({
    id: { type: Schema.Types.UUID, required: true, unique: true },
    session_id: { type: Schema.Types.UUID, ref: 'Session', required: true },
    device_id: { type: Schema.Types.UUID, ref: 'Client', required: true },
    },
    { timestamps: true })

const commandTemplateSchema = new Schema({
    id: { type: Schema.Types.UUID, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    created_by: { type: Schema.Types.UUID, ref: 'User', required: true },
    },
    { timestamps: true })

const commandSchema = new Schema({
    id: { type: Schema.Types.UUID, required: true, unique: true },
    session_id: { type: Schema.Types.UUID, ref: 'Session', required: true },
    sent_by: { type: Schema.Types.UUID, ref: 'User', required: true },
    command_template_id: { type: Schema.Types.UUID, ref: 'CommandTemplate', required: true },
    parameters: { type: String, required: true },
    },
    { timestamps: true })

const commandResponseSchema = new Schema({
    id: { type: Schema.Types.UUID, required: true, unique: true },
    command_id: { type: Schema.Types.UUID, ref: 'Command', required: true },
    device_id: { type: Schema.Types.UUID, ref: 'Device', required: true },
    response_text: { type: String, required: true },
    },
    { timestamps: true })


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

 //MODELS
const User = mongoose.model('User', userSchema)
const session = mongoose.model('User', sessionSchema)
const Client = mongoose.model('Client',clientSchema)
const SessionClient = mongoose.model('SessionClient',sessionClientSchema)
const CommandTemplate = mongoose.model('CommandTemplate', commandTemplateSchema)
const Command = mongoose.model('Command', commandSchema)
const CommandResponse = mongoose.model('CommandResponse', commandResponseSchema)
const AuditLog = mongoose.model('AuditLog', auditLogSchema)


app.get('/', (request, response) => {
    response.send('login')
})

app.post('/',(request,response) =>{
    response.send('login')
} )

app.get('/admin', (request,response) => {
    response.send('session')
})

app.get('/sessions', (request,response) => {
    response.send('session')
})






app.listen(PORT, () =>{
    console.log(`👋 server started on PORT ${PORT}`)
})