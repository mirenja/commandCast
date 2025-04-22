import express from 'express'
import { PORT,SSH_PASSWORD} from './config/app.js'
import './config/database.js'

import {User} from './models/user.js'
import {Session} from './models/session.js'
import {CommandTemplate} from './models/commandtemplate.js'
import {CommandResponse} from './models/commandResponse.js'
import {Command} from './models/command.js'
import {Client} from './models/client.js'
import {AuditLog} from './models/auditLog.js'
import { v4 as uuidv4 } from 'uuid'
import { connectAndExecute } from './services/sshService.js'


const app =express()
app.set('view engine', 'ejs')
app.use(express.static('public'))
// to read the form requests body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get('/', async (request, response) => {
    const clients = await Client.find({}).sort({ updatedAt: -1 }).exec()
    const message = request.query.message
    //console.log(clients)
    response.render('index',{message,clients})
})

app.post('/',(request,response) =>{
    response.send('login')
} )

app.get('/sessions', (request,response) => {
    response.render('sessions/index')
})

app.get('/show', (request,response) => {
    response.render('sessions/show')
})


app.get('/newclient', (request,response) => {
    response.render('clients/show')
})

app.post('/newclient', async(request,response) => {
    try{ 
        console.log('BODY:', request.body)
        const newClient = new Client({
            id: uuidv4(),
            name:request.body.name,
            mac_address:request.body.mac_address,
            ip_address:request.body.ip_address
        })

        await newClient.save()
        response.redirect('/?message=Device+added+successfully')
    }catch(error){
        console.error(error)
        response.redirect('/?message='+error)
    }
})

app.post('/connect', async (request,response) => {
    const ip_address = request.body.ip_address//when we put auntentication is should use the logged in user
    const id = request.body.id
    console.log('Received request to connect to:', {ip_address })
    try {
      const result = await connectAndExecute({
        host: ip_address,
        // username, set default for dev
        password:SSH_PASSWORD,
        command: 'echo Connected'
        
      })
      console.log(result)
      console.log("Remote server connected succesfully")
      await Client.updateOne({ id }, { status: 'online' })
      console.log("db status updated to online")
      response.send({ success: true, message: result });
    } catch (error) {
        console.log("server ddnt connect -------------")
        console.log(error)
      response.send({ error })
    }
  })





app.listen(PORT, () =>{
    console.log(`👋 server started on PORT ${PORT}`)
})

export default app