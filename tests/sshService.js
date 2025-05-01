// import request from 'supertest'
// import app from '../app.js'
// import { connect } from '../services/sshService.js'
// import { Client } from 'ssh2'

// ///actually test the differenet responses from connection
// jest.mock('ssh2', () => {
//     const mockConn = {
//         on: jest.fn().mockReturnThis(),
//         connect: jest.fn()
//     }
//     return { Client: jest.fn(() => mockConn) }
// })