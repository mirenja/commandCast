import express from "express" 
import pkg from "express-openid-connect"
import { createClient, listClients } from "../services/clientService.js" 

const { requiresAuth } = pkg
const router = express.Router() 


router.post("/newclient", requiresAuth(), async (req, res, next) => {
try {
const client = await createClient(req.body) 
res.status(201).json(client) 
} catch (err) {
next(err) 
}
}) 


router.get("/clients", requiresAuth(), async (req, res, next) => {
try {
const { clients, onlineCount, offlineCount } = await listClients() 
res.render("clients", { clients, onlineCount, offlineCount }) 
} catch (err) {
next(err) 
}
}) 


export default router 