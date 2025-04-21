import { faker } from '@faker-js/faker'

const actions = [
    'COMMAND_SENT',//user
    'RESPONSE_RECEIVED',//user
    'DEVICE_JOINED',//client
    'SESSION_CLOSED',//user and client
    'AUTH_FAILURE',//user
    'CONNECTION_LOST',//device
    'RATE_LIMIT_TRIGGERED',//user and device
  ]

export const buildAuditLog = (sessionId, actorType, actorId, action, meta = {}) => {
    return {
      id: faker.string.uuid(),
      session_id: sessionId,
      actor_type: actorType, // "User" or "Device"
      actor_id: actorId,
      action:action,
      meta
    }
  }