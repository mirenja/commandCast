import express from 'express'
import { PORT } from './config/app.js'
import './config/database.js'

import {User} from './models/user.js'
import {Session} from './models/session.js'
import {CommandTemplate} from './models/commandtemplate.js'
import {CommandResponse} from './models/commandResponse.js'
import {Command} from './models/command.js'
import {Client} from './models/client.js'
import {AuditLog} from './models/auditLog.js'


const app =express()
app.set('view engine', 'ejs')
app.use(express.static('public'))


app.get('/', (request, response) => {
    response.render('index')
})

app.post('/',(request,response) =>{
    response.send('login')
} )

app.get('/admin', (request,response) => {
    response.send('session')
})

app.get('/sessions', (request,response) => {
    response.render('sessions/index')
})






app.listen(PORT, () =>{
    console.log(`👋 server started on PORT ${PORT}`)
})

export default app