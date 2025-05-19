import { jest } from '@jest/globals'
import request from 'supertest'


const mockSave = jest.fn().mockResolvedValue(true)
const sendCommandMock = jest.fn().mockResolvedValue('Command executed')
const connectMock = jest.fn().mockResolvedValue({ connected: true })


await jest.unstable_mockModule('../services/sshService.js', () => ({
  connect: connectMock,
  sendCommand: sendCommandMock,
}))

await jest.unstable_mockModule('../models/command.js', () => ({
  Command: function (data) {
    return {
      ...data,
      save: mockSave,
      _id: 'mock-command-id',
    }
  }
}))

await jest.unstable_mockModule('../models/commandResponse.js', () => ({
  CommandResponse: function (data) {
    return {
      ...data,
      save: mockSave,
    }
  }
}))


let app
const mockClientId = 'client-id-789'
const sessionId = 'session-789'
const userId = 'user-123'
const mockConn = { _sock: { readable: true, writable: true } }

beforeAll(async () => {
  const setup = await import('./setupTestApp.js')
  const { app: loadedApp } = await setup.setupTestApp()
  app = loadedApp

  app.connections.set(mockClientId, mockConn)
  app.onlineClients.set(mockClientId, { status: 'online' })
})


describe('POST /sendCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    app.connections.clear()
    app.onlineClients.clear()
    app.connections.set(mockClientId, mockConn)
    app.onlineClients.set(mockClientId, { status: 'online' })
  })

  test('should send an allowed command and save response', async () => {
    const response = await request(app)
      .post('/sendCommand')
      .set('Authorization', `Bearer fakeToken`)
      .send({ command: 'ls', category: 'file' })

  
    expect(response.body.success).toBe(true)
    expect(response.body.message).toBe('Command executed')
  })
})
