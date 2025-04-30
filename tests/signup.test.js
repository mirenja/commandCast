import request from 'supertest'
import app from '../app.js'

// #test state or interface an dnot if fucntion is called

describe('POST /signup', () => {
  it('should fail when email is invalid', async () => {
    const res = await request(app)
      .post('/signup')
      .send({
        name: 'John Doe',
        email: 'invalidemail',
        password: 'Valid123!',
        confirm_password: 'Valid123!'
      })
    
    expect(res.statusCode).toBe(302)
    expect(res.header['location']).toMatch("/signup?message=Invalid%20email%20format")
  })
  it('should fail when name is invalid', async () => {
    const res = await request(app)
    .post('/signup')
    .send({
      name: 123,
      email: 'jane@example.com',
      password: 'Valid123!!',
      confirm_password: 'Valid123!!'
    })
  
  expect(res.statusCode).toBe(302)
  expect(res.header['location']).toMatch(/message=Name%20must%20be%20a%20string/)

  })

  it('should fail when name len> 50', async () => {
    const res = await request(app)
    .post('/signup')
    .send({
      name: 'shhjhjdjkjjfnv m bhbshgzerghrkmlr ndbhhfrejofkoejof jnjjhggfstcgzwguhuwhdi jnjwudhwbdhbjsnqkdjj bhfbhbhwgugfugufgw bwjhfguguhfwjkjfihuhufwufug',
      email: 'jane@example.com',
      password: 'Valid123!',
      confirm_password: 'Valid123!'
    })
  
  expect(res.statusCode).toBe(302)
  expect(res.header['location']).toMatch("/signup?message=Name%20must%20be%20at%20most%2050%20characters")
})

  it('should fail when email len> 50', async () => {
    const res = await request(app)
    .post('/signup')
    .send({
      name: 'Jane Doe',
      email: 'shhjhjdjkjjfnv m bhbshgzerghrkmlr ndbhhfrejofkoejof jnjjhggfstcgzwguhuwhdi jnjwudhwbdhbjsnqkdjj bhfbhbhwgugfugufgw bwjhfguguhfwjkjfihuhufwufug',
      password: 'Valid123!',
      confirm_password: 'Valid123!'
    })
    expect(res.statusCode).toBe(302)
    expect(res.header['location']).toMatch(/message=Email%20must%20be%20at%20most%2050%20characters/)
  
    })

  it('should fail when password len> 50', async () => {
    const res = await request(app)
    .post('/signup')
    .send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'shhjhjdjkjjfnv m bhbshgzerghrkmlr ndbhhfrejofkoejof jnjjhggfstcgzwguhuwhdi jnjwudhwbdhbjsnqkdjj bhfbhbhwgugfugufgw bwjhfguguhfwjkjfihuhufwufug',
      confirm_password: 'Valid123!'
    })
    expect(res.statusCode).toBe(302)
    expect(res.header['location']).toMatch("/signup?message=Password%20must%20be%2010%E2%80%9320%20characters%20long")
  
    })

  it('should fail when password dont match', async () => {
    const res = await request(app)
    .post('/signup')
    .send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Valid123!',
      confirm_password: 'Valid1'
    })
  expect(res.statusCode).toBe(302)
  expect(res.header['location']).toMatch("/signup?message=Password%20must%20be%2010%E2%80%9320%20characters%20long")

  })

  it('should fail when password is short', async () => {
    const res = await request(app)
    .post('/signup')
    .send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Valid123!',
      confirm_password: 'Valid123!'
    })
  expect(res.statusCode).toBe(302)
  expect(res.header['location']).toMatch(/message=Password%20must%20be%2010%E2%80%9320%20characters%20long/)

  })

  it('should fail when password lacks special characters', async () => {
    const res = await request(app)
    .post('/signup')
    .send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Valid123!',
      confirm_password: 'Valid123!'
    })

  expect(res.statusCode).toBe(302)
  expect(res.header['location']).toMatch("/signup?message=Password%20must%20be%2010%E2%80%9320%20characters%20long")

  })


  it('should succeed with valid input', async () => {
    const res = await request(app)
      .post('/signup')
      .send({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Valid123!',
        confirm_password: 'Valid123!'
      })
    
    expect(res.statusCode).toBe(302) 
  })
})
