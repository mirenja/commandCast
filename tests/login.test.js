
import { generateAccessToken, validateUser } from '../services/acessToken'
import { User } from '../models/user.js'
import {mockingoose} from 'mockingoose'


jest.mock('../models/user.js')


describe('validateUser', () => {
  it('should return user if email and password match', async () => {
    const email = 'jane@gmail.com'
    const password = 'password123'
    const user = {
      _id: '12345',
      email: 'jane@gmail.com',
      password: 'password123',
    }

    mockingoose(User).toReturn(user, 'findOne')

    const result = await validateUser(email, password);

    expect(result).toEqual(user)
  })

  it('should throw an error if user is not found', async () => {
    const email = 'grace@gmail.com'
    const password = 'password123'

    mockingoose(User).toReturn(null, 'findOne');

    await expect(validateUser(email, password)).rejects.toThrowError('User not found');
  })

  it('should throw an error if password does not match', async () => {
    const email = 'grace@gmail.com';
    const password = 'password12345'
    const user = {
      _id: '12345',
      email: 'grace@gmail.com',
      password: 'password123',
    }

    mockingoose(User).toReturn(user, 'findOne')

    await expect(validateUser(email, password)).rejects.toThrowError('password does not match')
  })
})
