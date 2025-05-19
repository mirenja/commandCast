import express from 'express'
import { authenticateToken } from '../middlewares/authenticateToken.js'
import { isAdmin } from '../middlewares/isAdmin.js'
import { Client } from '../models/client.js'

const router = express.Router()

router.get('/dashboard',authenticateToken, async (request, response) => {
    
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

export default router
