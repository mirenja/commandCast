import { jest } from '@jest/globals'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'



// jest.unstable_mockModule('../models/session.js', () => {
//   const MockSession = jest.fn().mockImplementation(function () {
//     this.save = jest.fn().mockResolvedValue(true)
//     this.session_id = 'mockedSessionId'
//     this._id = 'mockedSessionObjectId'
//     this.createdAt = new Date("2025-05-17T08:32:46.886Z")
//   })

//   return {
//     Session: MockSession
//   }
// })

jest.unstable_mockModule('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true)
}))

jest.unstable_mockModule('../services/acessToken.js', () => ({
  generateAccessToken: jest.fn().mockResolvedValue('fake.jwt.token'),
  validateUser: jest.fn().mockResolvedValue({ _id: '123456', email: 'jane@example.com' }),
}))


let request
let app
let validateUser
let generateAccessToken

beforeAll(async () => {
  const supertestModule = await import('supertest')
  request = supertestModule.default

  const appModule = await import('../app.js')
  app = appModule.default

  const accessTokenModule = await import('../services/acessToken.js')
  validateUser = accessTokenModule.validateUser
  generateAccessToken = accessTokenModule.generateAccessToken

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(globalThis.__MONGO_URI__, {
      dbName: globalThis.__MONGO_DB_NAME__,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  }
})

beforeEach(() => {
  jest.clearAllMocks()
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

describe('POST /login validation rules', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // it('should fail when email is invalid', async () => {
  //   const response = await request(app)
  //     .post('/login')
  //     .send({
  //       email: 'invalidemail',
  //       password: 'Valid123!'
  //     })

  //   expect(response.statusCode).toBe(302)
  //   expect(response.header['location']).toMatch("/?message=invalid%20Email")
  // })

  // it('should fail when password is too long', async () => {
  //   const longPassword = 'a'.repeat(100)
  //   const response = await request(app)
  //     .post('/login')
  //     .send({
  //       email: 'jane@example.com',
  //       password: longPassword
  //     })

  //   expect(response.statusCode).toBe(302)
  //   expect(response.header['location']).toMatch("/?message=invalid%20password")
  // })

  it('should succeed with valid credentials and set cookies', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'jane@example.com', password: 'securePass123!' })

    expect(response.statusCode).toBe(302)
    expect(response.headers).toHaveProperty('set-cookie')

    const cookies = response.headers['set-cookie']

    expect(cookies.find(c => c.startsWith('token='))).toBeDefined()
    expect(cookies.find(c => c.startsWith('sessionCookie='))).toBeDefined()
    expect(response.header['location']).toBe('/dashboard')
  })
})


