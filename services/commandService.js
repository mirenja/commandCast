import { validationResult } from "express-validator" 
import { sendCommand } from "../src/utils/ssh.js" 
import { fileAndSystemCommands } from "./commandwhitelist.js" 
import { Command } from "../models/command.js" 
import { CommandResponse } from "../models/commandResponse.js" 

export async function handleSendCommand(connections, onlineClients,req, res) {
  const { command, category } = req.body 
  const sessionInfo = req.cookies.sessionCookie 
  const userId = req.user._id 

  validationResult(req).throw() 

  const connectedClientIds = Array.from(onlineClients.keys()) 

  for (const clientId of connectedClientIds) {
    const conn = connections.get(clientId) 

    if (!conn || !conn._sock || !conn._sock.readable || !conn._sock.writable) {
      return res.status(400).send({ error: "SSH connection not alive" }) 
    }

    const commandName = command.split(" ")[0] 
    if (!fileAndSystemCommands.includes(commandName)) {
      return res.status(403).send({ error: "Command not permitted" }) 
    }

    const output = await sendCommand(conn, commandName) 

    const newCommand = await Command.create({
      session_id: sessionInfo.id,
      sent_by: userId,
      client_id: clientId,
      command_text: command,
      command_category: category
    }) 

    await CommandResponse.create({
      command_id: newCommand._id,
      response_text: output
    }) 

    return res.send({ success: true, message: output }) 
  }
}
