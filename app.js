import "./instrument.mjs"
import express from 'express'
import * as Sentry from "@sentry/node"
import pkg from 'express-openid-connect'


import cookieParser from 'cookie-parser'
import { PORT,SSH_PASSWORD,username} from './config/app.js'

import jwt from 'jsonwebtoken'
import { authenticateToken} from './middlewares/authenticateToken.js'
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

import dashboardRouter from "./routes/dashboard.js"
import sessionsRouter from "./routes/sessions.js"
import clientsRouter from "./routes/clients.js"
import connectionsRoutes from "./routes/connections.js"
import commandsRouter from "./routes/commands.js"
import logoutRoutes from "./routes/logout.js"


export default function buildApp(database){
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
app.use(auth(config))       
app.use(setCurrentUser)     
app.use(logger)


const connections = new Map()
const onlineClients = new Map()

app.connections = connections
app.onlineClients = onlineClients


  app.use("/", dashboardRouter)
  app.use("/", sessionsRouter)
  app.use("/", clientsRouter)
  app.use("/", connectionsRoutes(connections, onlineClients))
  app.use("/", commandsRouter)
  app.use("/", logoutRoutes(connections, onlineClients))





///////


    //  app.get('/userManagement',requiresAuth(), isAdmin, async (req, res) => {
    //   const users = await User.find({})
    //   const currentSessionId =req.cookies.sessionCookie
    //   res.render('management/users', { users,currentSessionId })
    // })

    // app.get('/userManagement/:user_id',requiresAuth(), isAdmin, async (req, res) => {
    //   const user_id = req.params.user_id
    //   const user = await User.findOne({ _id : user_id})
    //   const currentSessionId =req.cookies.sessionCookie
    //   res.render('management/editUser', { currentSessionId,user })
    // })

    // app.post('/userManagement/:user_id/delete',requiresAuth(), isAdmin, async (req, res) => {
    //   try {
    //     await User.findByIdAndDelete(req.params.user_id)
    //     console.log("user deleted")
    //     const currentSessionId =req.cookies.sessionCookie
    //     res.redirect('/userManagement')


    //   }catch (error) {
    //     console.error(error)
    //     res.send('Error: No cookie was deleted.')
    //   }
     
    // })

    // app.post('/userManagement/:user_id/update',requiresAuth(), isAdmin, async (req, res) => {
    //   try {
    //     const { name, email, isAdmin } = req.body
    //     const role = req.body.isAdmin === 'true'
    //     const updatedUser = await User.findOneAndUpdate(
    //       {email:email},
    //       {name,email,isAdmin:!!role },
    //       { new: true }
    //     )
    //     console.log("USERR UPDATED",updatedUser)

    //     const currentSessionId =req.cookies.sessionCookie
    //     res.redirect('/userManagement')


    //   }catch (error) {
    //     console.error(error)
    //     res.send('Error:.',error)
    //   }
     
    // })


Sentry.setupExpressErrorHandler(app)


return app

}