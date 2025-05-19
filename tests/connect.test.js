import { jest } from '@jest/globals'
import request from 'supertest'

const connectMock = jest.fn().mockResolvedValue({ connected: true })
const sendCommandMock = jest.fn()
const addClientToSessionMock = jest.fn()
const removeClientToSessionMock = jest.fn()
const findOneAndUpdateMock = jest.fn().mockResolvedValue({ _id: '123', status: 'online' })

await jest.unstable_mockModule('../services/sshService.js', () => ({
  connect: connectMock,
  sendCommand :sendCommandMock
}))

await jest.unstable_mockModule('../models/client.js', () => ({
  Client: {
    findOneAndUpdate: findOneAndUpdateMock
  }
}))

await jest.unstable_mockModule('../services/clientToSession.js', () => ({
  addClientToSession: addClientToSessionMock,
  removeClientToSession: removeClientToSessionMock
}))

await jest.unstable_mockModule('../middlewares/authenticateToken.js', () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: 'test-user-id' }
    next()
  }
}))



const { setupTestApp } = await import('./setupTestApp.js')
const { app } = await setupTestApp()




describe('POST /connect', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

     it('should connect to remote server and update client status', async () => {
     const mockSessionCookie = {
       id: 'session123',
       session_id: 'e48f3fdb89778dc7',
       date: '18.5.2025',
       time: '23:07:09',
     } 

     const cookieValue = `sessionCookie=${encodeURIComponent(JSON.stringify(mockSessionCookie))}` 

     const res = await request(app)
       .post('/connect')
       .set('Cookie', cookieValue)
       .send({
         ip_address: '192.168.1.1',
         _id: 'client123',
       }) 
    // console.log('Response:', res)


     expect(res.status).toBe(200) 
     expect(res.body.message).toBe('Connected successfully') 
     expect(connectMock).toHaveBeenCalledWith({
       host: '192.168.1.1',
       username: expect.any(String),
       password: expect.any(String),
     }) 
     expect(findOneAndUpdateMock).toHaveBeenCalledWith(
       { _id: 'client123' },
       { status: 'online' },
       { new: true }
     ) 
   }) 

})
