
import { generateAccessToken, validateUser } from '../services/acessToken'
import { User } from '../models/user'
import mockingoose  from 'mockingoose'





describe('validateUser', () => {
  it('should return user if email and password match', async () => {
    const email = 'jane@gmail.com'
    const password = 'password123'
    const user = {
      _id:'6805f9bd5ee438a73bb0e6bb',
      name: 'Jane Doe',
      email: 'jane@gmail.com',
      password: 'password123',
      role: 'user'
    }

    mockingoose(User).toReturn(user, 'findOne')

    const result = await validateUser(email, password)

    
    expect(result.name).toEqual(user.name)
    expect(result.email).toEqual(user.email)
    expect(result.password).toEqual(user.password)
    expect(result.role).toEqual(user.role)
  })

  it('should throw an error if user is not found', async () => {
    const email = 'other@gmail.com'
    const password = 'password123'

   
    mockingoose(User).toReturn(null, 'findOne')

    await expect(validateUser(email, password)).rejects.toThrow('User not found')
  })

  it('should throw an error if password does not match', async () => {
    const email = 'jane@gmail.com'
    const password = 'wrongpassword'

    const user = {
      _id: '12345',
      email: 'jane@gmail.com',
      password: 'password123'
    };

    mockingoose(User).toReturn(user, 'findOne')

    await expect(validateUser(email, password)).rejects.toThrow('password does not match')
  })
})