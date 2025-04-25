import express from 'express'

import cookieParser from 'cookie-parser'
import { PORT,SSH_PASSWORD,username} from './config/app.js'
import './config/database.js'
import jwt from 'jsonwebtoken'
import {generateAccessToken,validateUser} from './services/acessToken.js'
import { authenticateToken} from './middlewares/authenticateToken.js'
import crypto from 'crypto'


import { logger } from './middlewares/logger.js'


import {User} from './models/user.js'
import {Session} from './models/session.js'
import {CommandTemplate} from './models/commandtemplate.js'
import {CommandResponse} from './models/commandResponse.js'
import {Command} from './models/command.js'
import {Client} from './models/client.js'
import {AuditLog} from './models/auditLog.js'
import { v4 as uuidv4 } from 'uuid'
import { connect,sendCommand } from './services/sshService.js'
import { setCurrentUser } from './middlewares/setCurrentUser.js'
import { getBerlinTime } from './services/berlinTime.js'



const app =express()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(cookieParser())

// to read the form requests body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

////middleware
app.use(cookieParser())
app.use(setCurrentUser)
app.use(logger)


export const connections = new Map()

app.get('/', async (request, response) => {
  response.render('index')
})

app.post('/login', async(request,response) => {
  try{ 
      //console.log('BODY:', request.body)
      const { email, password } = request.body

      console.log('user email:',email)

      const validatedUser = await validateUser(email,password)
      console.log("validated user is:",validatedUser)

      
      const token = await generateAccessToken({ userId: validatedUser._id })
      const session = new Session({
        id : uuidv4(),
        session_id:crypto.randomBytes(8).toString('hex'),
        started_by: validatedUser.id
      })

      await session.save()


      response.cookie('token',token,{
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 3600000 
        
      })
      const createdAt = session.createdAt
      const date = getBerlinTime(createdAt)
      const time = getBerlinTime(createdAt)

      // console.log("the date is now",date)
      // console.log("the date is now",time)

      const sessionCookie = {
        id:session.id,
        session_id:session.session_id,
        date:date.date,
        time:time.time

      }

      response.cookie('sessionCookie', sessionCookie, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 3600000,
      })

      console.log("the token is",token)
      response.redirect('/dashboard')

      // verify on middleware
      // function authenticateToken(req, res, next) {
      //   const authHeader = req.headers['authorization']
      //   const token = authHeader && authHeader.split(' ')[1]
      
      //   if (!token) return res.sendStatus(401)
      
      //   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      //     if (err) return res.sendStatus(403)
      
      //     req.user = user
      //     next()
      //   })
      // }
      

  }catch(error){
      console.error(error)
      response.redirect('/?message='+error)
  }
})

app.post('/logout', async(request,response) => {
  
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




app.get('/dashboard',authenticateToken, async (request, response) => {
    const clients = await Client.find({}).sort({ updatedAt: -1 }).exec()
    const onlineCount = clients.filter(client => client.status === 'online').length
    const offlineCount = clients.filter(client => client.status === 'offline').length
    
    const loggedInUser = request.loggedInUser
    const currentSessionId =request.cookies.sessionCookie
    // =request.session._id

    console.log("logged in user in dashoute",loggedInUser)
    //console.log(clients)
    response.render('dashboard',{loggedInUser,clients,onlineCount,offlineCount,currentSessionId})
})



app.get('/sessions', async (request,response) => {
  try{
    const clients = await Client.find({}).sort({ updatedAt: -1 }).exec()
    const onlineCount = clients.filter(client => client.status === 'online').length
    const offlineCount = clients.filter(client => client.status === 'offline').length
    // console.log('Clients fetched:', clients)
    response.render('sessions/index',{clients,onlineCount,offlineCount})
  }catch (error){
    console.error('Error fetching clients:', error)
  }
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