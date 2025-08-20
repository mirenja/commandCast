import express from "express" 
import { body, validationResult } from "express-validator" 
import pkg from 'express-openid-connect'
import { handleSendCommand } from "../services/commandService.js" 

const { requiresAuth } = pkg

const router = express.Router() 

// POST /sendCommand
router.post(
  "/sendCommand",
  requiresAuth(),
  body("command").isString().trim().escape(),
  async (req, res) => {
    try {
      await handleSendCommand(req, res) 
    } catch (err) {
      console.error(err) 
      res.status(500).json({ error: err.message || "Command failed" }) 
    }
  }
) 

export default router 
