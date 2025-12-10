import { Client } from "../models/client.js" 
import { addClientToSession, removeClientToSession } from "./sessionService.js" 
import { connect } from "../utils/ssh.js" 
import { SSH_PASSWORD, username } from "../config.js" 

export async function connectClient(req, res) {
  const { ip_address, _id } = req.body 
  const sessionCookie = req.cookies.sessionCookie 

  console.log("Connect request:", { ip_address, _id, sessionCookie }) 

  const conn = await connect({
    host: ip_address,
    username: username,
    password: SSH_PASSWORD
  }) 

  connections.set(_id, conn) 
  await Client.findOneAndUpdate({ _id }, { status: "online" }, { new: true }) 
  onlineClients.set(_id, { status: "online" }) 

  await addClientToSession(sessionCookie.id, _id) 

  return res.send({ success: true, message: "Connected successfully" }) 
}

export async function disconnectClient(req, res) {
  const _id = req.body 
  const sessionCookie = req.cookies.sessionCookie 

  const conn = connections.get(_id) 
  if (conn) {
    conn.end() 
    connections.delete(_id) 
  }

  await Client.updateOne({ _id }, { status: "offline" }, { new: true }) 
  onlineClients.delete(_id) 

  await removeClientToSession(sessionCookie.id, _id) 

  return res.send({ success: true, message: "Disconnected" }) 
}
