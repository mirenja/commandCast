import express from "express" 
import { logout } from "../services/logoutService.js" 

export default function(connections, onlineClients) {
  const router = express.Router() 

  router.post("/logout", async (req, res) => {
    await logout(connections, onlineClients, req, res) 
  }) 

  return router 
}
