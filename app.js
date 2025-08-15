import "./instrument.mjs"
import express from 'express'
import * as Sentry from "@sentry/node"
import pkg from 'express-openid-connect'


import cookieParser from 'cookie-parser'
import { PORT,SSH_PASSWORD,username} from './config/app.js'

import jwt from 'jsonwebtoken'
// import {generateAccessToken,validateUser} from './services/acessToken.js'
import { authenticateToken} from './middlewares/authenticateToken.js'
// import { generatedSalt,hashPassword,comparePassword } from './services/passwordHashing.js'
import crypto from 'crypto'
import {fileAndSystemCommands} from './services/commandwhitelist.js'
import validator from 'validator'


import { logger } from './middlewares/logger.js'
import { isAdmin } from "./middlewares/isAdmin.js"
import { signupValidationRules,validate } from './middlewares/signUpValidate.js'



import {User} from './models/user.js'
import {Session} from './models/session.js'

import {CommandResponse} from './models/commandresponse.js'
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
import { config } from './services/auth0.js'


export default function(database){
const app =express()
const { auth,requiresAuth } = pkg

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

app.use(auth(config))



const connections = new Map()
const onlineClients = new Map()

app.connections = connections
app.onlineClients = onlineClients



app.post('/logout', async(req,res) => {
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
    res.clearCookie('token')
    res.clearCookie('sessionCookie')
    res.oidc.logout({ returnTo: '/login' });

  }catch(error){
    res.redirect('/login?message='+error)
  }})

app.get('/',requiresAuth(), async (req, res) => {
    let sessionCookie = req.cookies.sessionCookie
    let user

    if (!sessionCookie) {
    // Create a new session 
    user = await User.findOne({ email: req.oidc.user.email});

    if (!user) {
    user = await User.create({
      id: uuidv4(),
      auth0_user_id: req.oidc.user.sub,
      email: req.oidc.user.email,
      name: req.oidc.user.name,
      isAdmin: false});
    }

    const session = new Session({
      session_id: crypto.randomBytes(8).toString('hex'),
      started_by: user._id
    });
    await session.save();

    const { date, time } = getBerlinTime(session.createdAt);

    // Set custom session cookie
    sessionCookie = { id: session.id, session_id: session.session_id, date, time };
    res.cookie('sessionCookie', sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 3600000
    });
    }
    
    const { page = 1, limit = 6 } = req.query

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
  
    const loggedInUser = user
    // console.log(loggedInUser)
    const currentSessionId =sessionCookie
    // console.log(`session cookie is ${currentSessionId}`)
    // =req.session._id

    // console.log("logged in user in dashoute",loggedInUser)
    //console.log(clients)
    res.render('dashboard',{clients,onlineCount,loggedInUser,offlineCount,currentSessionId,commandCategories,totalPages,currentPage: Number(page)})
})



app.get('/sessions',authenticateToken, async (req,res) => {
  try{
    
    const page = parseInt(req.query.page) || 1
    const sessionpage = parseInt(req.query.page) || 1
    const clientlimit = parseInt(req.query.clientlimit) || 6
    const sessionlimit = parseInt(req.query.sessionlimit) || 10

    const clients = await Client.find({}).sort({ updatedAt: -1 }).limit(clientlimit * 1).skip((page - 1) * clientlimit).exec()
    const onlineCount = clients.filter(client => client.status === 'online').length
    const offlineCount = clients.filter(client => client.status === 'offline').length

    const clientcount = await Client.countDocuments()
    const totalPages = Math.ceil(clientcount / clientlimit)

    // console.log('Clients fetched:', clients)
    const currentSessionId =req.cookies.sessionCookie
    const loggedInUser = res.locals.loggedInUser
    let sessions
    if (loggedInUser.isAdmin){
      sessions= await Session.find({}).sort({ updatedAt: -1 }).limit(sessionlimit * 1).skip((page - 1) * sessionlimit).exec()
    }else {
      sessions = await Session.find({ started_by: loggedInUser._id }).sort({ updatedAt: -1 }).limit(sessionlimit * 1).skip((page - 1) * sessionlimit).exec()
    }
    const sessioncount = await Session.countDocuments()
    const sessiontotalPages = Math.ceil(sessioncount / sessionlimit)
    // console.log("The current session logs are",sessions)
    const search = req.query.search?.trim()?.toLowerCase();
    if (search) {
      sessions = sessions.filter(session => 
        session.session_id?.toLowerCase().includes(search))
    }


    if (req.xhr) {
      return res.render('sessions/_table', { sessions })
    }
    res.render('sessions/index',{clients,onlineCount,offlineCount,sessions,currentSessionId,totalPages,currentPage: Number(page),sessiontotalPages,sessionPage: Number(sessionpage)})
    
  }catch (error){
    console.error('Error fetching clients:', error)
  }
})


app.get('/sessions/:session_id',authenticateToken, async (req,res) => {
  try{
    const currentSessionId =req.cookies.sessionCookie
    const session_id = req.params.session_id
   
    
    const session = await Session.findOne({ session_id })
      .populate({path: 'clients', model: Client,}).exec()

    if(!session) throw new Error('Session not found')
      // console.log(session)

    const populatedClients = await Promise.all(session.clients.map(async (client) => {
      const commands = await Command.find({ client_id: client._id, session_id: session._id }).exec()

      const commandsWithResponses = await Promise.all(commands.map(async (command) => {
        const commandResponse = await commandresponse.findOne({ command_id: command._id }).exec()

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
    res.render('sessions/show',{sessionData, currentSessionId})

  }catch (error){
    console.error('Error fetching clients:', error)
    res.status(404).send(error)
  }
})

app.get('/exportsession/:session_id',authenticateToken, async (req, res) => {
  const session_id = req.params.session_id
  //console.log("SESSION EX",session_id)
  //console.log(session_id)
  try{
    const session = await Session.findOne({ session_id})
    .populate({path: 'clients', model: Client,}).exec()

    if(!session) throw new Error('Session infor not found')

    const populatedClients = await Promise.all(session.clients.map(async (client) => {
      const commands = await Command.find({ client_id: client._id, session_id: session._id }).exec()

      const commandsWithResponses = await Promise.all(commands.map(async (command) => {
        const commandResponse = await commandresponse.findOne({ command_id: command._id }).exec()

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
          res: cmd.commandResponse?.response_text || 'No res'
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
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=${session.session_id}-session-export.txt`)
    res.send(sessionDataString)

  }
  catch (error){
    console.error('Error exporting session:', error)
    res.status(500).send('Server Error')
  }
})





app.get('/newclient',authenticateToken, (req,res) => {
    res.render('clients/newClient')
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
  
  async(req,res) => {
    try{ 
        // console.log('BODY:', req.body)
        validationResult(req).throw()
        
        const newClient = new Client({
            id: uuidv4(),
            name:req.body.name,
            mac_address:req.body.mac_address,
            ip_address:req.body.ip_address
        })

        await newClient.save()
        res.redirect('/dashboard?message=Device+added+successfully')
    }catch(error){
      console.log("device error")
      console.log(error)
      if (Array.isArray(error.errors)) {
        const firstError = error.errors[0].msg
        return res.redirect(`/dashboard?message=${encodeURIComponent(firstError)}`)
      }
      return res.redirect(`/dashboard?message=${encodeURIComponent('Unexpected error occurred')}`)

    }
})

app.get('/clients',authenticateToken, isAdmin, async (req, res) => {
  const clients = await Client.find({})
  const currentSessionId =req.cookies.sessionCookie
  res.render('clients/index', { clients,currentSessionId })
})

app.get('/clients/:client_id',authenticateToken, isAdmin, async (req, res) => {
  const client_id = req.params.client_id
  const selectedClient = await Client.findOne({ _id : client_id})
  const currentSessionId =req.cookies.sessionCookie
  res.render('clients/show', { currentSessionId,selectedClient})
})

app.post('/clients/:client_id/update',authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, ip_address } = req.body
    const client_id = req.params.client_id
    // console.log("THE CLIENT ID",id)
    const updatedClient = await Client.findOneAndUpdate(
      { _id : client_id},
      {name,ip_address},
      { new: true }
    )
    const currentSessionId =req.cookies.sessionCookie
    res.redirect('/clients')


  }catch (error) {
    console.error(error)
    res.send('Error:.',error)
  }
 
})

app.post('/clients/:client_id/delete',authenticateToken, isAdmin, async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.client_id)
    console.log("client deleted")
    const currentSessionId =req.cookies.sessionCookie
    res.redirect('/clients')


  }catch (error) {
    console.error(error)
    res.send('Error: No client deleted.')
  }
 
})



////

app.post('/connect',authenticateToken,
  
  async (req,res) => {
    const ip_address = req.body.ip_address//when we put auntentication is should use the logged in user
    const _id = req.body._id
    console.log('Cookies received:', req.cookies)
    const sessionCookie = req.cookies.sessionCookie
    console.log("Session cookie in connect",sessionCookie)
    console.log('Received req to connect to:', {ip_address })
    console.log('Received req to connect to ID:', {_id })
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
      // console.log("res",res)
      console.log('Parsed Cookies:', req.cookies)
      console.log('Raw Cookie Header:', req.headers.cookie);

      res.send({ success: true, message: 'Connected successfully' })

    } catch (error) {
        console.log("server ddnt connect -------------")
        console.log(error)
      res.status(500).json({ error: error.message || error.toString() })
    }
  })

  app.post('/disconnect',async (req, res) => {
    const _id = req.body
    const sessionCookie = req.cookies.sessionCookie
    console.log('Received req to DISconnect to ID:', {_id })
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
    res.send({ success: true, message: 'Disconnected' })
  })



  app.post('/sendCommand',authenticateToken,
    body('command').isString().trim().escape(),
    async (req,res) => {
    const { command ,category } = req.body
    const sessionInfo = req.cookies.sessionCookie
    const userId = req.user._id
    // console.log('USER INFO,',sessionInfo)
    // const id = req.body.id.id.data
    // const command = req.body.command
    // console.log('id is:............................', {_id})


    const connectedClientIds = Array.from(onlineClients.keys())
    
    for (const connectedClientId of connectedClientIds) {
      const conn = connections.get(connectedClientId) 
    
      console.log("ONLINE CLIENTS",connectedClientId)
      // console.log("CONNECTION",conn)
      //console.log('route handler Received req to connect to:', {conn})

      if (!conn) return res.status(400).send({ error: 'Client not connected' })

      if (!conn._sock || !conn._sock.readable || !conn._sock.writable) {
        return res.status(400).send({ error: 'SSH Connection not alive' })
      }

      try {
        validationResult(req).throw()
        const allowedCommands = fileAndSystemCommands

        const commandName = command.split(" ")[0]
        if (!allowedCommands.includes(commandName)){
          return res.status(403).send({ error: 'Command not permitted' })
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
        await newCommandres.save()

        console.log("added command res", newCommandResponse)
        res.send({ success: true, message: output })

      } catch (error) {
          console.log(error)
          res.send({ error })
      }
    }
    })


     app.get('/userManagement',authenticateToken, isAdmin, async (req, res) => {
      const users = await User.find({})
      const currentSessionId =req.cookies.sessionCookie
      res.render('management/users', { users,currentSessionId })
    })

    app.get('/userManagement/:user_id',authenticateToken, isAdmin, async (req, res) => {
      const user_id = req.params.user_id
      const user = await User.findOne({ _id : user_id})
      const currentSessionId =req.cookies.sessionCookie
      res.render('management/editUser', { currentSessionId,user })
    })

    app.post('/userManagement/:user_id/delete',authenticateToken, isAdmin, async (req, res) => {
      try {
        await User.findByIdAndDelete(req.params.user_id)
        console.log("user deleted")
        const currentSessionId =req.cookies.sessionCookie
        res.redirect('/userManagement')


      }catch (error) {
        console.error(error)
        res.send('Error: No cookie was deleted.')
      }
     
    })

    app.post('/userManagement/:user_id/update',authenticateToken, isAdmin, async (req, res) => {
      try {
        const { name, email, isAdmin } = req.body
        const role = req.body.isAdmin === 'true'
        const updatedUser = await User.findOneAndUpdate(
          {email:email},
          {name,email,isAdmin:!!role },
          { new: true }
        )
        console.log("USERR UPDATED",updatedUser)

        const currentSessionId =req.cookies.sessionCookie
        res.redirect('/userManagement')


      }catch (error) {
        console.error(error)
        res.send('Error:.',error)
      }
     
    })


    // app.get("/debug-sentry", function mainHandler(req, res) {
    //   throw new Error("My first Sentry error!");
    // })
    



Sentry.setupExpressErrorHandler(app)


return app

}