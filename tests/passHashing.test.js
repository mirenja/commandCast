
import { jest } from '@jest/globals'

jest.unstable_mockModule('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('fake_salt'),
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true)
}))

const { generatedSalt,hashPassword,comparePassword } = await import('../services/passwordHashing.js')
const bcrypt = await import('bcrypt')

describe('unit testing the password utilities with mocks', () => {
  test('generatedSalt returns a salt string', async () => {
    const salt = await generatedSalt()
    expect(salt).toBe('fake_salt')
    expect(bcrypt.genSalt).toHaveBeenCalledWith(12)
  })


test('hashPassword returns hashed password', async () => {
  const password = 'Password1234!'
  const salt = 'fake_salt'

  const hash = await hashPassword(password, salt)
  expect(hash).toBe('hashed_password')
  expect(bcrypt.hash).toHaveBeenCalledWith(password, salt)
})

test('comparePassword returns true when passwords match', async () => {
  const result = await comparePassword('Password1234!', 'hashed_password')
  expect(result).toBe(true)
  expect(bcrypt.compare).toHaveBeenCalledWith('Password1234!', 'hashed_password')
})

})


