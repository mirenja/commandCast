import { Session } from "../models/session.js"
import { Command } from "../models/command.js"
import { CommandResponse } from "../models/commandresponse.js"


export function filterSessions({ clients, sessions, search, page, totalPages, sessiontotalPages }) {
  if (search) {
    sessions = sessions.filter((s) =>
      s.session_id?.toLowerCase().includes(search.toLowerCase())
    )
  }

  const onlineCount = clients.filter(c => c.status === "online").length
  const offlineCount = clients.length - onlineCount

  return {
    clients,
    onlineCount,
    offlineCount,
    sessions,
    totalPages,
    currentPage: page,
    sessiontotalPages,
    sessionPage: page,
  }
}

export async function getSessionDetails(session_id) {
  const session = await Session.findOne({ session_id }).populate("clients").exec()
  if (!session) throw new Error("Session not found")

  const populatedClients = await Promise.all(
    session.clients.map(async (client) => {
      const commands = await Command.find({ client_id: client._id, session_id: session._id }).exec()

      for (const cmd of commands) {
        cmd.commandResponse = await CommandResponse.findOne({ command_id: cmd._id }).exec()
      }
      client.commands = commands
      return client
    })
  )

  return {
    session_id: session.session_id,
    createdAt: session.createdAt,
    started_by: session.started_by,
    clients: populatedClients,
  }
}

export async function exportSession(session_id) {
  const session = await getSessionDetails(session_id)

  const cleanedClients = session.clients.map((client) => ({
    name: client.name,
    mac_address: client.mac_address,
    ip_address: client.ip_address,
    status: client.status,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
    commands: client.commands.map((cmd) => ({
      command_text: cmd.command_text,
      executed_at: cmd.createdAt,
      res: cmd.commandResponse?.response_text || "No response",
    })),
  }))

  return {
    filename: `${session.session_id}-session-export.txt`,
    content: JSON.stringify(
      {
        session_id: session.session_id,
        createdAt: session.createdAt,
        started_by: session.started_by,
        clients: cleanedClients,
      },
      null,
      2
    ),
  }
}
