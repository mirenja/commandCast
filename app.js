import express from 'express'
import { PORT,SSH_PASSWORD,username} from './config/app.js'
import './config/database.js'
import jwt from 'jsonwebtoken'
import {generateAccessToken} from './services/acessToken.js'


import {User} from './models/user.js'
import {Session} from './models/session.js'
import {CommandTemplate} from './models/commandtemplate.js'
import {CommandResponse} from './models/commandResponse.js'
import {Command} from './models/command.js'
import {Client} from './models/client.js'
import {AuditLog} from './models/auditLog.js'
import { v4 as uuidv4 } from 'uuid'
import { connect,sendCommand } from './services/sshService.js'


const app =express()
app.set('view engine', 'ejs')
app.use(express.static('public'))
// to read the form requests body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

export const connections = new Map()

app.get('/', async (request, response) => {
  response.render('index')
})

app.post('/login', async(request,response) => {
  try{ 
      //console.log('BODY:', request.body)
      const { email, password } = request.body
      const user = await User.findOne({
        email:email
      }).exec()

      if (!user) { return response.redirect('/?message=User+not+found')}

      if (user.password !== password) {
        return response.redirect('/?message=Incorrect+password')
      }
      const token = generateAccessToken(user.id)
      response.json(token)
  
      response.redirect('/dashboard')

  }catch(error){
      console.error(error)
      response.redirect('/dashboard?message='+error)
  }
})

app.get('/signup', async (request, response) => {
  response.render('signup')
})


app.post('/signup', async(request,response) => {
  try{ 
      console.log('BODY:', request.body)
      const newUser = new User({
          id: uuidv4(),
          name:request.body.name,
          email:request.body.email,
          password:request.body.password
      })
      const confirm_password = request.body.confirm_password

      if (confirm_password == newUser.password){
        await newUser.save()
        response.redirect('/dashboard?message=User+added+successfully')
      }else{
        const message= "password does not match"
        response.redirect('/signup='+message)
      }
      
  }catch(error){
      console.error(error)
      response.redirect('/dashboard?message='+error)
  }
})




app.get('/dashboard', async (request, response) => {
    const clients = await Client.find({}).sort({ updatedAt: -1 }).exec()
    const onlineCount = clients.filter(client => client.status === 'online').length
    const offlineCount = clients.filter(client => client.status === 'offline').length
    const message = request.query.message
    //console.log(clients)
    response.render('dashboard',{message,clients,onlineCount,offlineCount})
})



app.get('/sessions', async (request,response) => {
    const clients = await Client.find({}).sort({ updatedAt: -1 }).exec()
    
    response.render('sessions/index',{clients})
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
    const _id = request.body._id
    console.log('Received request to connect to:', {ip_address })
    try {
      const conn = await connect({
        host: ip_address,
        username: username,
        password:SSH_PASSWORD
        })

      
      //console.log(conn)
      console.log("Remote server connected succesfully")
      console.log(conn)
      
      connections.set(_id,conn)
      await Client.updateOne({ _id }, { status: 'online' })
      console.log("db status updated to online")
      response.send({ success: true, message: 'Connected successfully' })

    } catch (error) {
        console.log("server ddnt connect -------------")
        console.log(error)
      response.send({ error })
    }
  })

  app.post('/disconnect',async (request, response) => {
    const _id = request.body._id
    const conn = connections.get(_id);
    if (conn) {
      conn.end()
      connections.delete(id)
    }
    await Client.updateOne({ _id }, { status: 'offline' })
    console.log("db status updated to offline")
    response.send({ success: true, message: 'Disconnected' })
  })



  app.post('/sendCommand', async (request,response) => {
    const { _id, command } = request.body
    // const id = request.body.id.id.data
    // const command = request.body.command
    console.log('id is:............................', {_id})
    const conn= await connections.get(_id)
    //console.log('route handler Received request to connect to:', {conn})

    if (!conn) return response.status(400).send({ error: 'Client not connected' })

    try {
      const output = await sendCommand(conn,command)
      console.log("-----------------command output---__-----")
      console.log(output)
      response.send({ success: true, message: output })

    } catch (error) {
        console.log(error)
      response.send({ error })
    }
  })








export default app