import { Client } from "../models/client.js" 

export async function logout(connections, onlineClients, req, res) {
  try {

    for (const [_id, conn] of connections.entries()) {
      try {
        conn.end() 
        await Client.updateOne({ _id }, { status: "offline" }) 
      } catch (error) {
        console.log("Error disconnecting", error) 
      }
    }

    connections.clear() 
    onlineClients.clear() 

    res.clearCookie("token") 
    res.clearCookie("sessionCookie") 

    res.oidc.logout({ returnTo: "/login" }) 
  } catch (error) {
    res.redirect("/login?message=" + error) 
  }
}
