import { Session } from "../models/session.js"

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