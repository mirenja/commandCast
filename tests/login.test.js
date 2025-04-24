
import { generateAccessToken, validateUser } from '../services/acessToken'
import { User } from '../models/user'
import mockingoose  from 'mockingoose'
import jwt from 'jsonwebtoken'





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


// jest.mocked(jwt.verify).mockImplementation(
//   jest.fn((_token, _secretOrPublicKey, _options, callback) => {
//     return callback(null, { id: 0 });
//   })
// );

// foo();
// expect(promiseFunction).toHaveBeenCalledWith({ id: 0 })


// jest.mock('jsonwebtoken')

// describe('generateAccessToken', () => {
//   it('should return a signed token', () => {
//     const fakeToken = 'mocked.jwt.token';
//     const user_id = '12345';

//     // 👇 mock jwt.sign to return a fake token
//     jwt.sign.mockReturnValue(fakeToken);

//     const result = generateAccessToken({ user_id });

//     // 👇 assert that it returns the mocked token
//     expect(result).toBe(fakeToken);

//     // 👇 optionally, assert it was called with correct args
//     expect(jwt.sign).toHaveBeenCalledWith(
//       { user_id },
//       expect.any(String),
//       { expiresIn: '1800s' }
//     );
//   });
// });