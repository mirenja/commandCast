import { jest } from '@jest/globals'

jest.unstable_mockModule('bcrypt', () => ({
  default: {
    compare: jest.fn().mockResolvedValue(true),
  }
}))

jest.unstable_mockModule('../services/acessToken.js', () => ({
  generateAccessToken: jest.fn().mockResolvedValue('fake.jwt.token'),
  validateUser: jest.fn().mockResolvedValue({ _id: '123abc', email: 'jane@example.com' }),
}))

const request = (await import('supertest')).default
const app = (await import('../app.js')).default
const { generateAccessToken, validateUser } = await import('../services/acessToken.js')




// const mockUser = { _id: '123abc', email: 'jane@example.com' }
// validateUser.mockResolvedValue(mockUser)
// generateAccessToken.mockResolvedValue('fake.jwt.token')

describe('POST /login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fail when email is invalid', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'invalidemail',
        password: 'Valid123!'
      })

    expect(response.statusCode).toBe(302)
    expect(response.header['location']).toMatch("/?message=invalid%20Email")
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

  it('should succeed with valid credentials and set cookies', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'jane@example.com',
        password: 'securePassword123'
      })

    expect(response.statusCode).toBe(302)
    expect(response.header['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('token='),
        expect.stringContaining('HttpOnly'),
        expect.stringContaining('sessionCookie=')
      ])
    )
    expect(response.header['location']).toBe('/dashboard')
  })
})
