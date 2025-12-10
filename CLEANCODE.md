
## Readability and Cleanliness
it should pass the tests, reveal intention, no duplication(DRY), fewer elements
proper and consistent naming conventions
names follow a convention:variables and fucntions names use camelcase, and it communicates the intention so its self documenmting 
using names from the domain and sticking to  that like going with clients instead of clients then devices..

const sessionCookie = await ensureSessionCookie(req, res, user)  
const onlineCount = clients.filter(c => c.status === "online").length 
const offlineCount = clients.length - onlineCount 

*** DRY (Contains no duplication of code or logic)

## Magic numbers / strings
/connections.js
const statusOnline = statusOnline
const statusOffline = statusOffline

await Client.findByIdAndUpdate(_id, { status: statusOnline }, { new: true }) 
        if (sessionCookie) await addClientToSession(sessionCookie.id, _id) 

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


## There is no commented out code (dead code)

there is abit of dead code that i havent refactored.

## Clear separation of concerns and well structured
MVC, services, routes
### Functions 
export async function addClientToSession(sessionId,clientId){
    const session = await Session.findById(sessionId)

    if (!session){
        throw new Error("Session not found")
    }
    if (!session.clients.includes(clientId)){
        session.clients.push(clientId)
        await session.save()
    }
    return session
}

export async function removeClientToSession(sessionId,clientId){
    const session = await Session.findById(sessionId)

    if (!session){
        throw new Error("Session not found")
    }
    if (!session.clients.includes(clientId)){
        session.clients.pull(clientId)
        await session.save()
    }
    return session
}
## error handling
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

## Simplicity, early return
 const connectedClientIds = Array.from(onlineClients.keys()) 
        if (!connectedClientIds.length) return res.status(400).send({ error: "No connected clients" }) 


#test coverage, and sigle push after test ach check test if it faisl.s

