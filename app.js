import "./instrument.mjs"
import express from 'express'
import * as Sentry from "@sentry/node"


import cookieParser from 'cookie-parser'
import { PORT,SSH_PASSWORD,username} from './config/app.js'

import jwt from 'jsonwebtoken'
import {generateAccessToken,validateUser} from './services/acessToken.js'
import { authenticateToken} from './middlewares/authenticateToken.js'
import { generatedSalt,hashPassword,comparePassword } from './services/passwordHashing.js'
import crypto from 'crypto'
import {fileAndSystemCommands} from './services/commandwhitelist.js'
import validator from 'validator'


import { logger } from './middlewares/logger.js'
import { isAdmin } from "./middlewares/isAdmin.js"
import { signupValidationRules,validate } from './middlewares/signUpValidate.js'


import {User} from './models/user.js'
import {Session} from './models/session.js'

import {CommandResponse} from './models/commandResponse.js'
import {Command} from './models/command.js'
import {Client} from './models/client.js'
import {AuditLog} from './models/auditLog.js'
import { v4 as uuidv4 } from 'uuid'
import { connect,sendCommand } from './services/sshService.js'
import { setCurrentUser } from './middlewares/setCurrentUser.js'
import { getBerlinTime } from './services/berlinTime.js'
import { addClientToSession,removeClientToSession } from './services/clientToSession.js'
import { userInfo } from 'os'
import { body, validationResult } from 'express-validator'


export default function(database){
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



const connections = new Map()
const onlineClients = new Map()

app.connections = connections
app.onlineClients = onlineClients

app.get('/', async (request, response) => {
  response.render('index')
})

app.post('/login',
  body('email').isString().isLength({ max: 50 }).isEmail().withMessage("invalid Email").trim().escape(),
  body('password').isString().isLength({ max: 20 }).withMessage("invalid password").trim().escape(),
   async(request,response) => {
  try{ 
      console.log('BODY:', request.body)
      validationResult(request).throw()
      const { email, password } = request.body
      // console.log(email, password)


      // console.log('user email:',email)
      console.log('Login attempt:', request.body)

      const validatedUser = await validateUser(email,password)
      console.log("validated user is:",validatedUser)

      
      const token = await generateAccessToken({ userId: validatedUser._id })
       console.log("token",token)
      const session = new Session({
        session_id:crypto.randomBytes(8).toString('hex'),
        started_by: validatedUser._id
      })
      console.log("session id for crypto",session.session_id)
      await session.save()
      console.log("we have now saved the session")


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

      // console.log("the token is",token)
      response.redirect('/dashboard')
      console.log("THE RESPONSE HEADER!!!")
      // console.log(response)
      // console.log("Status Code:", response.statusCode)
      // console.log(response.getHeaders())

      
      

  }catch(error){
    if (Array.isArray(error.errors)) {
      const messages = error.errors.map(err => err.msg);
      let firstMessage = messages[0];
      response.redirect('/?message=' + encodeURIComponent(firstMessage));
    } else {
      response.redirect('/?message=' + encodeURIComponent('An unexpected error occurred'));
    }  
}
      
  }
)

app.post('/logout', async(request,response) => {
  try{
    for (const [_id, conn] of connections.entries()){
      try{
        conn.end()
        await Client.updateOne({ _id }, { status: 'offline' })
      }
      catch(error)
      {
        console.log("Error disconnecting",error)
      }
    }
   //ran after seeding
    // await Client.updateMany({}, { status: 'offline' })
    connections.clear()
    onlineClients.clear()
    response.clearCookie('token')
    response.clearCookie('sessionCookie')

    response.redirect('/')
  }catch(error){
    response.redirect('/?message='+error)
  }})

app.get('/signup', async (request, response) => {
  response.render('signup')
})


app.post('/signup',signupValidationRules, validate,async(request,response) => {
  try{ 

    // console.log('Inside /signup route')
    const salt = await generatedSalt()
    const hashedPassword = await hashPassword(request.body.password, salt)

    const newUser = new User({
        id: uuidv4(),
        name:request.body.name,
        email:request.body.email,
        password:hashedPassword
    })

    await newUser.save()
    // console.log('User saved, about to redirect')

    // console.log("user added!!")
    response.redirect('/?message=User+added+successfully')

  }catch(error){
    if (Array.isArray(error.errors)) {
      console.log("All validation errors:")
      console.log(error.errors)
      const messages = error.errors.map(err => err.msg)
      let firstMessage = messages[0]
      if (firstMessage == 'Invalid value'){
        firstMessage = "invalid Email"
        return response.redirect('/signup?message=' + encodeURIComponent(firstMessage))
      }
      return response.redirect('/signup?message=' + encodeURIComponent(firstMessage))

    }
  }})

app.get('/passwordReset', async (request, response) => {
  response.render('passwordReset')
})


app.post('/passwordReset',
  body('email').isString().isLength({ max: 50 }).isEmail().escape(),
  body('password').isString().isLength({ min:10, max: 20 }).withMessage("invalid password").matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{10,20}$/).withMessage('Password must be atleast 10 characters long').escape(),
  body('confirm_password').isString().isLength({  min:10, max: 20  }).custom((value, { req }) => {
    if (value !== req.body.password) { 
      throw new Error('Passwords do not match')}
      return true}),
  async(request,response) => {
  try{ 
      validationResult(request).throw()
      //console.log('BODY:', request.body)

      const password = request.body.password
      const confirm_password = request.body.confirm_password
      const email = request.body.email
      if (confirm_password !== password){
        const message= "password does not match"
        response.redirect('/passwordReset?message='+encodeURIComponent(message))
      }

      const salt = await generatedSalt()
      const hashedPassword = await hashPassword(request.body.password, salt)

      const resetPassword = await User.findOneAndUpdate({email :email},{ password: hashedPassword },{ new: true })

      response.redirect('/?message=User+updated+successfully')

  }catch(error){
      console.error(error)
      if (Array.isArray(error.errors)) {
        console.log("All validation errors:")
        console.log(error.errors)
        const messages = error.errors.map(err => err.msg)
        let firstMessage = messages[0]
        if (firstMessage == 'Invalid value'){
          firstMessage = "invalid Email"
          return response.redirect('/passwordReset?message='+encodeURIComponent(firstMessage))
        }
        return response.redirect('/passwordReset?message='+encodeURIComponent(firstMessage))
  
      }

  }
})





app.get('/dashboard',authenticateToken, async (request, response) => {
    
    const { page = 1, limit = 6 } = request.query

    const clients = await Client.find({}).sort({ updatedAt: -1 }).limit(limit * 1).skip((page - 1) * limit).exec()
    const onlineCount = clients.filter(client => client.status === 'online').length
    const offlineCount = clients.filter(client => client.status === 'offline').length
    const count = await Client.countDocuments()
    const totalPages = Math.ceil(count / limit)
    const commandCategories = [
      'General Monitoring',
      'System Info',
      'Networking',
      'Configuration'
    ]
    //console.log("THE SESSION COOKIES!!!")
  
    // const loggedInUser = request.user
    // console.log(loggedInUser)
    const currentSessionId =request.cookies.sessionCookie
    // =request.session._id

    // console.log("logged in user in dashoute",loggedInUser)
    //console.log(clients)
    response.render('dashboard',{clients,onlineCount,offlineCount,currentSessionId,commandCategories,totalPages,currentPage: Number(page)})
})



app.get('/sessions',authenticateToken, async (request,response) => {
  try{
    
    const page = parseInt(request.query.page) || 1
    const sessionpage = parseInt(request.query.page) || 1
    const clientlimit = parseInt(request.query.clientlimit) || 6
    const sessionlimit = parseInt(request.query.sessionlimit) || 10

    const clients = await Client.find({}).sort({ updatedAt: -1 }).limit(clientlimit * 1).skip((page - 1) * clientlimit).exec()
    const onlineCount = clients.filter(client => client.status === 'online').length
    const offlineCount = clients.filter(client => client.status === 'offline').length

    const clientcount = await Client.countDocuments()
    const totalPages = Math.ceil(clientcount / clientlimit)

    // console.log('Clients fetched:', clients)
    const currentSessionId =request.cookies.sessionCookie
    const loggedInUser = response.locals.loggedInUser
    let sessions
    if (loggedInUser.isAdmin){
      sessions= await Session.find({}).sort({ updatedAt: -1 }).limit(sessionlimit * 1).skip((page - 1) * sessionlimit).exec()
    }else {
      sessions = await Session.find({ started_by: loggedInUser._id }).sort({ updatedAt: -1 }).limit(sessionlimit * 1).skip((page - 1) * sessionlimit).exec()
    }
    const sessioncount = await Session.countDocuments()
    const sessiontotalPages = Math.ceil(sessioncount / sessionlimit)
    // console.log("The current session logs are",sessions)
    const search = request.query.search?.trim()?.toLowerCase();
    if (search) {
      sessions = sessions.filter(session => 
        session.session_id?.toLowerCase().includes(search))
    }


    if (request.xhr) {
      return response.render('sessions/_table', { sessions })
    }
    response.render('sessions/index',{clients,onlineCount,offlineCount,sessions,currentSessionId,totalPages,currentPage: Number(page),sessiontotalPages,sessionPage: Number(sessionpage)})
    
  }catch (error){
    console.error('Error fetching clients:', error)
  }
})


app.get('/sessions/:session_id',authenticateToken, async (request,response) => {
  try{
    const currentSessionId =request.cookies.sessionCookie
    const session_id = request.params.session_id
   
    
    const session = await Session.findOne({ session_id })
      .populate({path: 'clients', model: Client,}).exec()

    if(!session) throw new Error('Session not found')
      // console.log(session)

    const populatedClients = await Promise.all(session.clients.map(async (client) => {
      const commands = await Command.find({ client_id: client._id, session_id: session._id }).exec()

      const commandsWithResponses = await Promise.all(commands.map(async (command) => {
        const commandResponse = await CommandResponse.findOne({ command_id: command._id }).exec()

        command.commandResponse = commandResponse
        return command
      }))
      client.commands = commandsWithResponses
      return client
    }))

    const sessionData = {
      session_id: session.session_id,
      createdAt: session.createdAt,
      started_by: session.started_by,
      clients: populatedClients,
    }
    console.log("individual session data",sessionData )
    response.render('sessions/show',{sessionData, currentSessionId})

  }catch (error){
    console.error('Error fetching clients:', error)
    response.status(404).send(error)
  }
})

app.get('/exportsession/:session_id',authenticateToken, async (request, response) => {
  const session_id = request.params.session_id
  //console.log("SESSION EX",session_id)
  //console.log(session_id)
  try{
    const session = await Session.findOne({ session_id})
    .populate({path: 'clients', model: Client,}).exec()

    if(!session) throw new Error('Session infor not found')

    const populatedClients = await Promise.all(session.clients.map(async (client) => {
      const commands = await Command.find({ client_id: client._id, session_id: session._id }).exec()

      const commandsWithResponses = await Promise.all(commands.map(async (command) => {
        const commandResponse = await CommandResponse.findOne({ command_id: command._id }).exec()

        command.commandResponse = commandResponse
        return command
      }))
      client.commands = commandsWithResponses
      return client
    }))

    const cleanClientData = (client) => {
      return {
        name: client.name,
        mac_address: client.mac_address,
        ip_address: client.ip_address,
        status: client.status,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
        commands: client.commands.map(cmd => ({
          command_text: cmd.command_text,
          executed_at: cmd.createdAt,
          response: cmd.commandResponse?.response_text || 'No response'
        }))
      }
    }

    const sessionData = {
      session_id: session.session_id,
      createdAt: session.createdAt,
      started_by: session.started_by,
      clients:populatedClients.map(cleanClientData)
    }
    const sessionDataString = JSON.stringify(sessionData, null, 2)
    response.setHeader('Content-Type', 'text/plain');
    response.setHeader('Content-Disposition', `attachment; filename=${session.session_id}-session-export.txt`)
    response.send(sessionDataString)

  }
  catch (error){
    console.error('Error exporting session:', error)
    response.status(500).send('Server Error')
  }
})





app.get('/newclient',authenticateToken, (request,response) => {
    response.render('clients/newClient')
})

app.post('/newclient',
  body('name').isString().trim().escape(),
  body('mac_address').isString().trim().escape(),
  body('ip_address').custom((value, { req }) => {
    if (!validator.isIP(value)) {
      throw new Error('Invalid IP address')
    }
    return true
  }),
  
  async(request,response) => {
    try{ 
        // console.log('BODY:', request.body)
        validationResult(request).throw()
        
        const newClient = new Client({
            id: uuidv4(),
            name:request.body.name,
            mac_address:request.body.mac_address,
            ip_address:request.body.ip_address
        })

        await newClient.save()
        response.redirect('/dashboard?message=Device+added+successfully')
    }catch(error){
      console.log("device error")
      console.log(error)
      if (Array.isArray(error.errors)) {
        const firstError = error.errors[0].msg
        return response.redirect(`/dashboard?message=${encodeURIComponent(firstError)}`)
      }
      return response.redirect(`/dashboard?message=${encodeURIComponent('Unexpected error occurred')}`)

    }
})

app.get('/clients',authenticateToken, isAdmin, async (request, response) => {
  const clients = await Client.find({})
  const currentSessionId =request.cookies.sessionCookie
  response.render('clients/index', { clients,currentSessionId })
})

app.get('/clients/:client_id',authenticateToken, isAdmin, async (request, response) => {
  const client_id = request.params.client_id
  const selectedClient = await Client.findOne({ _id : client_id})
  const currentSessionId =request.cookies.sessionCookie
  response.render('clients/show', { currentSessionId,selectedClient})
})

app.post('/clients/:client_id/update',authenticateToken, isAdmin, async (request, response) => {
  try {
    const { name, ip_address } = request.body
    const client_id = request.params.client_id
    // console.log("THE CLIENT ID",id)
    const updatedClient = await Client.findOneAndUpdate(
      { _id : client_id},
      {name,ip_address},
      { new: true }
    )
    const currentSessionId =request.cookies.sessionCookie
    response.redirect('/clients')


  }catch (error) {
    console.error(error)
    response.send('Error:.',error)
  }
 
})

app.post('/clients/:client_id/delete',authenticateToken, isAdmin, async (request, response) => {
  try {
    await Client.findByIdAndDelete(request.params.client_id)
    console.log("client deleted")
    const currentSessionId =request.cookies.sessionCookie
    response.redirect('/clients')


  }catch (error) {
    console.error(error)
    response.send('Error: No client deleted.')
  }
 
})



////

app.post('/connect',authenticateToken,
  
  async (request,response) => {
    const ip_address = request.body.ip_address//when we put auntentication is should use the logged in user
    const _id = request.body._id
    console.log('Cookies received:', request.cookies)
    const sessionCookie = request.cookies.sessionCookie
    console.log("Session cookie in connect",sessionCookie)
    console.log('Received request to connect to:', {ip_address })
    console.log('Received request to connect to ID:', {_id })
    try {
      const conn = await connect({
        host: ip_address,
        username: username,
        password:SSH_PASSWORD
        })

      
      //console.log(conn)
      console.log("Remote server connected succesfully")
      // console.log(conn)
      
      connections.set(_id,conn)
      await Client.findOneAndUpdate({ _id }, { status: 'online' },{ new: true })
      onlineClients.set( _id,{ status: 'online' })
      await addClientToSession(sessionCookie.id, _id)
      console.log('Calling addClientToSession with:', _id)
      // if (!updatedClient) {
      //   console.log(`No client found with _id: ${_id} ${updatedSession}`)
      // } else {
      //   console.log(`Client ${_id} ${updatedSession} updated to online`)
      // }
      // console.log("response",response)
      console.log('Parsed Cookies:', request.cookies)
      console.log('Raw Cookie Header:', request.headers.cookie);

      response.send({ success: true, message: 'Connected successfully' })

    } catch (error) {
        console.log("server ddnt connect -------------")
        console.log(error)
      response.status(500).json({ error: error.message || error.toString() })
    }
  })

  app.post('/disconnect',async (request, response) => {
    const _id = request.body
    const sessionCookie = request.cookies.sessionCookie
    console.log('Received request to DISconnect to ID:', {_id })
    console.log(_id)
    const conn = connections.get(_id);
    if (conn) {
      conn.end()
      connections.delete(id)
    }
    await Client.updateOne({ _id }, { status: 'offline' },{ new: true })
    onlineClients.delete(_id)
    await removeClientToSession(sessionCookie.id, _id)
    console.log("db status updated to offline")
    response.send({ success: true, message: 'Disconnected' })
  })



  app.post('/sendCommand',authenticateToken,
    body('command').isString().trim().escape(),
    async (request,response) => {
    const { command ,category } = request.body
    const sessionInfo = request.cookies.sessionCookie
    const userId = request.user._id
    // console.log('USER INFO,',sessionInfo)
    // const id = request.body.id.id.data
    // const command = request.body.command
    // console.log('id is:............................', {_id})


    const connectedClientIds = Array.from(onlineClients.keys())
    
    for (const connectedClientId of connectedClientIds) {
      const conn = connections.get(connectedClientId) 
    
      console.log("ONLINE CLIENTS",connectedClientId)
      // console.log("CONNECTION",conn)
      //console.log('route handler Received request to connect to:', {conn})

      if (!conn) return response.status(400).send({ error: 'Client not connected' })

      if (!conn._sock || !conn._sock.readable || !conn._sock.writable) {
        return response.status(400).send({ error: 'SSH Connection not alive' })
      }

      try {
        validationResult(request).throw()
        const allowedCommands = fileAndSystemCommands

        const commandName = command.split(" ")[0]
        if (!allowedCommands.includes(commandName)){
          return response.status(403).send({ error: 'Command not permitted' })
        }

        const output = await sendCommand(conn,commandName)
        console.log(output)
        console.log("-----------------command output---__-----")
        console.log(output)
        const newCommand = new Command({
          session_id:sessionInfo.id,
          sent_by:userId,
          client_id:connectedClientId,
          command_text:command,
          command_category:category


        })
        await newCommand.save()
        

        const newCommandResponse = new CommandResponse({
          command_id:newCommand._id,
          response_text:output
        })
        await newCommandResponse.save()

        console.log("added command Response", newCommandResponse)
        response.send({ success: true, message: output })

      } catch (error) {
          console.log(error)
          response.send({ error })
      }
    }
    })


     app.get('/userManagement',authenticateToken, isAdmin, async (request, response) => {
      const users = await User.find({})
      const currentSessionId =request.cookies.sessionCookie
      response.render('management/users', { users,currentSessionId })
    })

    app.get('/userManagement/:user_id',authenticateToken, isAdmin, async (request, response) => {
      const user_id = request.params.user_id
      const user = await User.findOne({ _id : user_id})
      const currentSessionId =request.cookies.sessionCookie
      response.render('management/editUser', { currentSessionId,user })
    })

    app.post('/userManagement/:user_id/delete',authenticateToken, isAdmin, async (request, response) => {
      try {
        await User.findByIdAndDelete(request.params.user_id)
        console.log("user deleted")
        const currentSessionId =request.cookies.sessionCookie
        response.redirect('/userManagement')


      }catch (error) {
        console.error(error)
        response.send('Error: No cookie was deleted.')
      }
     
    })

    app.post('/userManagement/:user_id/update',authenticateToken, isAdmin, async (request, response) => {
      try {
        const { name, email, isAdmin } = request.body
        const role = request.body.isAdmin === 'true'
        const updatedUser = await User.findOneAndUpdate(
          {email:email},
          {name,email,isAdmin:!!role },
          { new: true }
        )
        console.log("USERR UPDATED",updatedUser)

        const currentSessionId =request.cookies.sessionCookie
        response.redirect('/userManagement')


      }catch (error) {
        console.error(error)
        response.send('Error:.',error)
      }
     
    })


    // app.get("/debug-sentry", function mainHandler(request, response) {
    //   throw new Error("My first Sentry error!");
    // })
    



Sentry.setupExpressErrorHandler(app)


return app

}