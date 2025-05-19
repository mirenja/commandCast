import express from 'express'
import { authenticateToken } from '../middlewares/authenticateToken.js'
import { isAdmin } from '../middlewares/isAdmin.js'
import { Client } from '../models/client.js'

const router = express.Router()

router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const clients = await Client.find({ status: 'online' }).sort({ createdAt: -1 }).lean()
    res.render('clients', { clients })
  } catch (error) {
    res.redirect('/dashboard?message=' + encodeURIComponent('Error fetching online clients'))
  }
})




export default router
