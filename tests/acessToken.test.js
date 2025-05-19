import { jest } from '@jest/globals'
await jest.unstable_mockModule('jsonwebtoken', () => {
  return {
    sign: jest.fn()
  }
})

await jest.unstable_mockModule('../models/user.js', () => {
  return {
    User: {
      findOne: jest.fn()
    }
  }
})

await jest.unstable_mockModule('../services/passwordHashing.js', () => {
  return {
    comparePassword: jest.fn()
  }
})

const jwt = await import('jsonwebtoken')
const { User } = await import('../models/user.js')
const { comparePassword } = await import('../services/passwordHashing.js')
const { generateAccessToken, validateUser } = await import('../services/acessToken.js')


describe('generateAccessToken', () => {
  it('should generate a JWT token with user_id and TOKEN_SECRET', () => {
    const fakeToken = 'fake.jwt.token'
    const userId = { id: '12345tres' }
    
    jwt.sign.mockReturnValue(fakeToken)

    const token = generateAccessToken(userId)
    
    expect(jwt.sign).toHaveBeenCalledWith(userId, expect.any(String), { expiresIn: '1800s' })
    expect(token).toBe(fakeToken)
  })
})

describe('validateUser', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should throw error if user is not found', async () => {
    User.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) })

    await expect(validateUser('nonexistent@example.com', 'password')).rejects.toThrow('User not found')
    expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' })
  })

  it('should throw error if password does not match', async () => {
    const fakeUser = { password: 'hashedpassword' }
    User.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) })
    comparePassword.mockResolvedValue(false)

    await expect(validateUser(' jane@gmail.com', 'wrongpassword')).rejects.toThrow('Password does not match')
    expect(comparePassword).toHaveBeenCalledWith('wrongpassword', fakeUser.password)
  })

  it('should return user if email and password are valid', async () => {
    const fakeUser = { _id: 'user123tres', password: 'hashedpassword' }
    User.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(fakeUser) })
    comparePassword.mockResolvedValue(true)

    const result = await validateUser(' jane@gmail.com', 'validpassword1!')

    expect(result).toBe(fakeUser)
    expect(comparePassword).toHaveBeenCalledWith('validpassword1!', fakeUser.password)
  })
})