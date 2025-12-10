import express from "express" 
import pkg from "express-openid-connect"

import { ensureUserFromOIDC } from "../services/userService.js" 
import { ensureSessionCookie } from "../services/sessionCookieService.js" 
import { getClientsPaginatedAndStats } from "../services/clientService.js" 
import { commandCategories } from "../config/constants.js" 

const { requiresAuth } = pkg
const router = express.Router() 


router.get("/", requiresAuth(), async (req, res) => {
try {
const user = await ensureUserFromOIDC(req.oidc.user) 

const sessionCookie = await ensureSessionCookie(req, res, user) 
const page = Number(req.query.page) || 1 
const limit = Number(req.query.limit) || 6 


const { clients, onlineCount, offlineCount, totalPages, currentPage } =
await getClientsPaginatedAndStats({ page, limit }) 

res.render("dashboard", {clients,onlineCount,offlineCount,loggedInUser: user,currentSessionId: sessionCookie,commandCategories,totalPages,currentPage,}) 
} catch (err) {
    console.error("Error in dashboard route:", err) 
    res.redirect("/login?message=" + encodeURIComponent("Unexpected error")) 
}
}) 


export default router 