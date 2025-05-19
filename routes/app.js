import express from 'express'
import cookieParser from 'cookie-parser'
import { logger } from './middlewares/logger.js'
import { setCurrentUser } from './middlewares/setCurrentUser.js'
import authRoutes from './routes/auth.js'
import dashboardRoutes from './routes/dashboard.js'
import clientRoutes from './routes/clients.js'
import sessionRoutes from './routes/sessions.js'
import passwordResetRoutes from './routes/passwordReset.js'
import connectRoutes from './routes/connect.js'

const app = express()

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(setCurrentUser)
app.use(logger)

app.connections = new Map()
app.onlineClients = new Map()


app.use('/', authRoutes)
app.use('/', passwordResetRoutes)
app.use('/', dashboardRoutes)
app.use('/clients', clientRoutes)
app.use('/sessions', sessionRoutes)
app.use('/', connectRoutes)

export default app
