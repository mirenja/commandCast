import request from 'supertest'
import app from '../app'
import cookieParser from 'cookie-parser'

describe('POST /logout', () => {
    it('should clear the token and sessionCookie and redirect to the home page', async () => {
        const response = await request(app).get("/logout")
        expect(response.statusCode).toBe(200)
    })
  })