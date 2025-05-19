import request from 'supertest'
import { jest } from '@jest/globals'

//consider using validateuser 

const findOneAndUpdateMock = jest.fn()
const generatedSaltMock = jest.fn()
const hashPasswordMock = jest.fn()
const comparePasswordMock = jest.fn()



jest.unstable_mockModule('../models/user.js', () => ({
  User: { findOneAndUpdate: findOneAndUpdateMock }
}))

jest.unstable_mockModule('../services/passwordHashing.js', () => ({
  generatedSalt: generatedSaltMock,
  hashPassword: hashPasswordMock,
  comparePassword: comparePasswordMock,
}))

const { setupTestApp } = await import('./setupTestApp.js')
const { User } = await import('../models/user.js')


let app


beforeAll(async () => {
  const setup = await setupTestApp()
  app = setup.app
})


describe('POST /passwordReset', () => {
   beforeEach(() => {
    jest.clearAllMocks()
  })

   it('should fail when email is invalid', async () => {
     const response = await request(app)
       .post('/passwordReset')
       .send({
         email: 'invalidemail',
         password: 'Valid12345!'
       })
 
     expect(response.statusCode).toBe(302)
     expect(response.header['location']).toMatch("/passwordReset?message=invalid%20Email")
 
   })

   it('should fail when password is too long', async () => {
       const longPassword = 'a'.repeat(100)
       const response = await request(app)
         .post('/passwordReset')
         .send({
           email: 'jane@example.com',
           password: longPassword
         })
   
       expect(response.statusCode).toBe(302)
       expect(response.header['location']).toMatch("/passwordReset?message=invalid%20password")
     })


    it('should fail when passwords do not match', async () => {
    const response = await request(app)
      .post('/passwordReset')
      .send({
        email: 'jane@gmail.com',
        password: 'ValidPass123!',
        confirm_password: 'Mismatch123!'
      })

    
    expect(response.status).toBe(302)
    expect(response.headers.location).toContain('/passwordReset?message=')
    })

    it('should successfully reset password and redirect', async () => {

      generatedSaltMock.mockResolvedValue('fakesalt')
      hashPasswordMock.mockResolvedValue('hashedPassword1234!')
      findOneAndUpdateMock.mockResolvedValue({ email: 'jane@gmail.com' })

      const response = await request(app)
        .post('/passwordReset')
        .send({
          email: 'jane@gmail.com',
          password: 'ValidPass123!',
          confirm_password: 'ValidPass123!'
        })

     expect(generatedSaltMock).toHaveBeenCalled()
     expect(hashPasswordMock).toHaveBeenCalledWith('ValidPass123!', 'fakesalt')
     expect(findOneAndUpdateMock).toHaveBeenCalledWith(
       { email: 'jane@gmail.com' },
       { password: 'hashedPassword1234!' },
       { new: true }
     )
     expect(response.status).toBe(302)
     expect(response.headers.location).toBe('/?message=User+updated+successfully')

    })
})
