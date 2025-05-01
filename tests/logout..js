import request from 'supertest'
import app from '../app.js'

describe('GET /logout', () => {
  let response

  beforeEach(async () => {
    response = await request(app).get('/logout')
  })

  it('should clear authentication cookies', () => {
    const cookies = response.headers['set-cookie']

    expect(cookies).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^token=;/), 
        expect.stringMatching(/^sessionCookie=;/) 
      ])
    )
  })

  it('should redirect to home page', () => {
    expect(response.statusCode).toBe(302)
    expect(response.header['location']).toBe('/')
  })
})
