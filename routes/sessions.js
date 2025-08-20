import express from "express" 
import pkg from "express-openid-connect" 
import { Session } from "../models/session.js" 
import { Client } from "../models/client.js" 
import { getSessionDetails, exportSession } from "../services/sessionService.js" 

const { requiresAuth } = pkg 
const router = express.Router() 

// GET all sessions with pagination
router.get("/", requiresAuth(), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1 
    const clientLimit = parseInt(req.query.clientlimit) || 6 
    const sessionLimit = parseInt(req.query.sessionlimit) || 10 

    // Fetch sessions with pagination
    const sessions = await Session.find({})
      .sort({ updatedAt: -1 })
      .limit(sessionLimit)
      .skip((page - 1) * sessionLimit)
      .populate("clients")
      .exec() 

    // Count total sessions for pagination
    const totalSessions = await Session.countDocuments() 
    const totalPages = Math.ceil(totalSessions / sessionLimit) 

    // Fetch clients for counting online/offline
    const clients = await Client.find({})
      .sort({ updatedAt: -1 })
      .limit(clientLimit)
      .skip((page - 1) * clientLimit)
      .exec() 

    const onlineCount = clients.filter(c => c.status === "online").length 
    const offlineCount = clients.filter(c => c.status === "offline").length 

    const currentSessionId = req.cookies.sessionCookie 
    const loggedInUser = res.locals.loggedInUser 

    if (req.xhr) {
      return res.render("sessions/_table", { sessions }) 
    }

    res.render("sessions/index", {
      sessions,
      clients,
      onlineCount,
      offlineCount,
      totalPages,
      currentPage: page,
      sessiontotalPages: totalPages,
      sessionPage: page,
      currentSessionId,
      loggedInUser,
    }) 
  } catch (err) {
    console.error("Error fetching sessions:", err) 
    res.status(500).send("Server error") 
  }
}) 

// GET a single session by session_id
router.get("/:session_id", requiresAuth(), async (req, res) => {
  try {
    const currentSessionId = req.cookies.sessionCookie 
    const sessionData = await getSessionDetails(req.params.session_id) 
    res.render("sessions/show", { sessionData, currentSessionId }) 
  } catch (err) {
    console.error("Error fetching session:", err) 
    res.status(404).send(err.message) 
  }
}) 

// EXPORT a session
router.get("/export/:session_id", requiresAuth(), async (req, res) => {
  try {
    const { filename, content } = await exportSession(req.params.session_id) 
    res.setHeader("Content-Type", "text/plain") 
    res.setHeader("Content-Disposition", `attachment  filename=${filename}`) 
    res.send(content) 
  } catch (err) {
    console.error("Error exporting session:", err) 
    res.status(500).send("Export failed") 
  }
}) 

export default router 
