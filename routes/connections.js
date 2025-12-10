
import express from "express" 
import { validationResult, body } from "express-validator" 
import { Client } from "../models/client.js" 
import { Command } from "../models/command.js" 
import { CommandResponse } from "../models/commandResponse.js" 
import { addClientToSession, removeClientToSession } from "../services/clientToSession.js" 
import { PORT,SSH_PASSWORD,username} from '../config/app.js'
import { Client as SSHClient } from "ssh2" 
import { fileAndSystemCommands } from "../services/commandwhitelist.js"

export default function (connections, onlineClients) {
  const router = express.Router() 


  router.post("/connect", async (req, res) => {
    try {
      const { ip_address, _id } = req.body 
      const sessionCookie = req.cookies.sessionCookie 
      const statusOnline = statusOnline
      const statusOffline = statusOffline


      const conn = new SSHClient() 
      conn.on("ready", async () => {
        connections.set(_id, conn) 
        onlineClients.set(_id, { status: statusOnline }) 

        await Client.findByIdAndUpdate(_id, { status: statusOnline }, { new: true }) 
        if (sessionCookie) await addClientToSession(sessionCookie.id, _id) 

        return res.send({ success: true, message: "Connected successfully" }) 
      }).connect({ host: ip_address, username, password: SSH_PASSWORD }) 

    } catch (error) {
      console.error("Error connecting client:", error) 
      return res.status(500).json({ error: error.message || error.toString() }) 
    }
  }) 

  router.post("/disconnect", async (req, res) => {
    try {
      const _id = req.body 
      const sessionCookie = req.cookies.sessionCookie 

      const conn = connections.get(_id) 
      if (conn) {
        conn.end() 
        connections.delete(_id) 
      }

      onlineClients.delete(_id) 
      await Client.findByIdAndUpdate(_id, { status: statusOffline }, { new: true }) 
      if (sessionCookie) await removeClientToSession(sessionCookie.id, _id) 

      return res.send({ success: true, message: "Disconnected" }) 
    } catch (error) {
      console.error("Error disconnecting client:", error) 
      return res.status(500).json({ error: error.message || error.toString() }) 
    }
  }) 

  // Send command
  router.post(
    "/sendCommand",
    body("command").isString().trim().escape(),
    async (req, res) => {
      try {
        validationResult(req).throw() 

        const { command, category } = req.body 
        const sessionInfo = req.cookies.sessionCookie 
        const userId = req.user._id 

        const connectedClientIds = Array.from(onlineClients.keys()) 
        if (!connectedClientIds.length) return res.status(400).send({ error: "No connected clients" }) 

        for (const clientId of connectedClientIds) {
          const conn = connections.get(clientId) 

          if (!conn || !conn._sock || !conn._sock.readable || !conn._sock.writable) {
            return res.status(400).send({ error: "SSH connection not alive" }) 
          }

          const commandName = command.split(" ")[0] 
          if (!fileAndSystemCommands.includes(commandName)) {
            return res.status(403).send({ error: "Command not permitted" }) 
          }

          const output = await new Promise((resolve, reject) => {
            conn.exec(command, (err, stream) => {
              if (err) reject(err) 
              let data = "" 
              stream.on("close", () => resolve(data)) 
              stream.on("data", (chunk) => (data += chunk.toString())) 
              stream.stderr.on("data", (chunk) => (data += chunk.toString())) 
            }) 
          }) 

          const newCommand = await Command.create({
            session_id: sessionInfo.id,
            sent_by: userId,
            client_id: clientId,
            command_text: command,
            command_category: category,
          }) 

          await CommandResponse.create({
            command_id: newCommand._id,
            response_text: output,
          }) 

          console.log("Command sent to client:", clientId, "Output:", output) 
        }

        return res.send({ success: true, message: "Commands sent to all connected clients" }) 
      } catch (error) {
        console.error("Error sending command:", error) 
        return res.status(500).send({ error: error.message || error.toString() }) 
      }
    }
  ) 

  return router 
}
