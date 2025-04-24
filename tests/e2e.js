
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app from '../app.js'
import { Client } from '../models/client.js'

import { jest } from '@jest/globals'

// Mocking sshService.
jest.mock('../services/sshService.js', () => ({
  connect: jest.fn(() => Promise.resolve('mockConnection')),
  sendCommand: jest.fn(() => Promise.resolve('mock command output'))
}))

describe('E2E Flow Test: Add Device -> Connect -> Send Command -> Get Output', () => {
  let mongoServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  it('should add a new device, connect to it, send a command, and return output', async () => {
    // 1. Add a client
    const newClient = {
      name: 'testpc',
      mac_address: '00-1a-2B-3C-4D-5E',
      ip_address: '192.168.178.25'
    }

    const addRes = await request(app)
      .post('/newclient')
      .send(newClient)

    expect(addRes.statusCode).toBe(302) // due to redirection

    const savedClient = await Client.findOne({ name: 'testpc' })
    expect(savedClient).toBeTruthy()

    // 2. Connect the client
    const connectRes = await request(app)
      .post('/connect')
      .send({ ip_address: savedClient.ip_address, _id: savedClient._id.toString() })

    expect(connectRes.body.success).toBe(true)

    // 3. Send a command
    const commandRes = await request(app)
      .post('/sendCommand')
      .send({ _id: savedClient._id.toString(), command: 'ls' })

    expect(commandRes.body.success).toBe(true)
    expect(commandRes.body.message).toBe('mock command output')
  })
})
