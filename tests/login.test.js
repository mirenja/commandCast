import { jest } from '@jest/globals'
import request from 'supertest'


const validateUserMock = jest.fn()
const generateAccessTokenMock = jest.fn()

const saveMock = jest.fn().mockResolvedValue(true)

await jest.unstable_mockModule('../models/session.js', () => {
  return {
    Session: function(sessionData) {
      return {
        ...sessionData,
        save: saveMock,
        id: 'mocked-session-id',
        createdAt: new Date('2025-05-18T10:00:00Z'),
      }
    }
  }
})

const getBerlinTimeMock = jest.fn().mockImplementation((date) => ({
  date: '2025-05-18',
  time: '12:00:00'
}))

import crypto from 'crypto'
jest.spyOn(crypto, 'randomBytes').mockReturnValue(Buffer.alloc(16, 0))


jest.unstable_mockModule('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true)
}))

jest.unstable_mockModule('../services/acessToken.js', () => ({
  validateUser: validateUserMock,
  generateAccessToken: generateAccessTokenMock,
}))


jest.unstable_mockModule('../services/berlinTime.js', () => ({
  getBerlinTime: getBerlinTimeMock
}))


const { setupTestApp } = await import('./setupTestApp.js')
let app
beforeAll(async () => {
  const setup = await setupTestApp()
  app = setup.app
})


describe('POST /login validation rules', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should fail when email is invalid', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'invalidemail',
        password: 'Valid12345!'
      })

    expect(response.statusCode).toBe(302)
    expect(response.header['location']).toMatch("/?message=invalid%20Email")
    expect(validateUserMock).not.toHaveBeenCalled()

  })

  it('should fail when password is too long', async () => {
    const longPassword = 'a'.repeat(100)
    const response = await request(app)
      .post('/login')
      .send({
        email: 'jane@example.com',
        password: longPassword
      })

    expect(response.statusCode).toBe(302)
    expect(response.header['location']).toMatch("/?message=invalid%20password")
  })

    it('should login successfully with valid credentials and set cookies', async () => {
    validateUserMock.mockResolvedValueOnce({ _id: '47e84d2ca5ed' })
    generateAccessTokenMock.mockResolvedValueOnce('mockedtoken')

    const res = await request(app)
      .post('/login')
      .send({ email: 'jane@example.com', password: 'ValidPass1234!' })

    expect(res.status).toBe(302)
    expect(res.header['location']).toBe('/dashboard')
    expect(validateUserMock).toHaveBeenCalledWith('jane@example.com', 'ValidPass1234!')
    expect(generateAccessTokenMock).toHaveBeenCalledWith({ userId: '47e84d2ca5ed' })

    const cookies = res.headers['set-cookie']
    expect(cookies).toBeDefined()
    expect(cookies.length).toBeGreaterThanOrEqual(2)

    const tokenCookie = cookies.find(c => c.startsWith('token='))
    expect(tokenCookie).toBeDefined()
    expect(tokenCookie).toMatch(/HttpOnly/)
    expect(tokenCookie).toMatch(/Secure/)
    expect(tokenCookie).toMatch(/SameSite=Strict/)
    expect(tokenCookie).toMatch(/Max-Age=3600/)

    
    const sessionCookie = cookies.find(c => c.startsWith('sessionCookie='))
    expect(sessionCookie).toBeDefined()
    expect(sessionCookie).toMatch(/HttpOnly/)
    expect(sessionCookie).toMatch(/Secure/)
    expect(sessionCookie).toMatch(/SameSite=Strict/)
    expect(sessionCookie).toMatch(/Max-Age=3600/)
  })
})






