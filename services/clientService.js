import { Client } from "../models/client.js" 


export async function createClient(data) {
const client = new Client(data) 
await client.save() 
return client 
}

export async function listClients() {
const clients = await Client.find() 
const onlineCount = clients.filter(c => c.status === "online").length 
const offlineCount = clients.length - onlineCount 
return { clients, onlineCount, offlineCount } 
}

export async function getClientsPaginatedAndStats({ page = 1, limit = 6 } = {}) {
const p = Number(page) || 1 
const l = Number(limit) || 6 


const clients = await Client.find({}).sort({ updatedAt: -1 }).limit(l).skip((p - 1) * l).exec() 

const onlineCount = clients.filter((c) => c.status === "online").length 
const offlineCount = clients.filter((c) => c.status === "offline").length 


const count = await Client.countDocuments() 
const totalPages = Math.max(1, Math.ceil(count / l)) 


return { clients, onlineCount, offlineCount, totalPages, currentPage: p } 
}