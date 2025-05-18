import {jest} from '@jest/globals'
import request from 'supertest'
import mongoose from 'mongoose'
import app from '../app.js'
import {User} from '../models/user.js'
//import * as passUtils  from '../services/passwordHashing.js'
import { generatedSalt,hashPassword,comparePassword } from '../services/passwordHashing.js'





// #test state or interface an dnot if fucntion is called
describe('GET signup page', () => {
  test("It should return the signup page on GET /signup ", async () => {
    const response = await request(app).get("/signup")
    // console.log("returns",response)
    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toMatch(/html/)

    expect(response.text).toContain('name="name"')
    expect(response.text).toContain('name="email"')
    expect(response.text).toContain('name="password"')
    expect(response.text).toContain('<button')
    expect(response.text).toContain('<form')
    expect(response.text).toContain('a href="/"')
    
  })
})


describe('POST /signup signupvalidation rules check', () => {
  

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(globalThis.__MONGO_URI__, {
        dbName: globalThis.__MONGO_DB_NAME__,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
    }
  })

afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
})


  it('should fail when email is invalid', async () => {
   const response = await request(app)
      .post('/signup')
      .send({
        name: 'John Doe',
        email: 'invalidemail',
        password: 'Valid123!',
        confirm_password: 'Valid123!'
      })
    
    expect(response.statusCode).toBe(302)
    expect(response.header['location']).toMatch("/signup?message=Invalid%20email%20format")
  })
  it('should fail when name is invalid', async () => {
   const response = await request(app)
    .post('/signup')
    .send({
      name: 123,
      email: 'jane@example.com',
      password: 'Valid123!!',
      confirm_password: 'Valid123!!'
    })
  
  expect(response.statusCode).toBe(302)
  expect(response.header['location']).toMatch(/message=Name%20must%20be%20a%20string/)

  })

  it('should fail when name len> 50', async () => {
   const response = await request(app)
    .post('/signup')
    .send({
      name: 'shhjhjdjkjjfnv m bhbshgzerghrkmlr ndbhhfrejofkoejof jnjjhggfstcgzwguhuwhdi jnjwudhwbdhbjsnqkdjj bhfbhbhwgugfugufgw bwjhfguguhfwjkjfihuhufwufug',
      email: 'jane@example.com',
      password: 'Valid123!',
      confirm_password: 'Valid123!'
    })
  
  expect(response.statusCode).toBe(302)
  expect(response.header['location']).toMatch("/signup?message=Name%20must%20be%20at%20most%2050%20characters")
})

  it('should fail when email len> 50', async () => {
   const response = await request(app)
    .post('/signup')
    .send({
      name: 'Jane Doe',
      email: 'shhjhjdjkjjfnv m bhbshgzerghrkmlr ndbhhfrejofkoejof jnjjhggfstcgzwguhuwhdi jnjwudhwbdhbjsnqkdjj bhfbhbhwgugfugufgw bwjhfguguhfwjkjfihuhufwufug',
      password: 'Valid123!',
      confirm_password: 'Valid123!'
    })
    expect(response.statusCode).toBe(302)
    expect(response.header['location']).toMatch(/message=Email%20must%20be%20at%20most%2050%20characters/)
  
    })

  it('should fail when password len> 50', async () => {
   const response = await request(app)
    .post('/signup')
    .send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'shhjhjdjkjjfnv m bhbshgzerghrkmlr ndbhhfrejofkoejof jnjjhggfstcgzwguhuwhdi jnjwudhwbdhbjsnqkdjj bhfbhbhwgugfugufgw bwjhfguguhfwjkjfihuhufwufug',
      confirm_password: 'Valid123!'
    })
    expect(response.statusCode).toBe(302)
    expect(response.header['location']).toMatch("/signup?message=Password%20must%20be%2010%E2%80%9320%20characters%20long")
  
    })

  it('should fail when password dont match', async () => {
   const response = await request(app)
    .post('/signup')
    .send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Valid12345!',
      confirm_password: 'Valid12346!'
    })
  expect(response.statusCode).toBe(302)
  expect(response.header['location']).toMatch("/signup?message=Passwords%20do%20not%20match")

  })

  it('should fail when password is short', async () => {
   const response = await request(app)
    .post('/signup')
    .send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Valid123!',
      confirm_password: 'Valid123!'
    })
  expect(response.statusCode).toBe(302)
  expect(response.header['location']).toMatch("/signup?message=Password%20must%20be%2010%E2%80%9320%20characters%20long")

  })

  it('should fail when password lacks special characters', async () => {
   const response = await request(app)
    .post('/signup')
    .send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Valid12345',
      confirm_password: 'Valid12345'
    })

  expect(response.statusCode).toBe(302)
  expect(response.header['location']).toMatch("/signup?message=Password%20must%20include%20letters%2C%20numbers%2C%20and%20a%20special%20character")

  })


  it('should succeed with valid input', async () => {
     const validUser = {
      name: 'Jane Doe',
      email: 'jane@gmail.com',
      password: 'Valid1234!',
      confirm_password: 'Valid1234!' 
    }
   const response = await request(app)
      .post('/signup')
      .send(validUser)

    const savedUser = await User.findOne({ email: validUser.email })
    expect(response.statusCode).toBe(302) 
    expect(response.header['location']).toBe('/?message=User+added+successfully')
    expect(savedUser).not.toBeNull()
    expect(savedUser.name).toBe(validUser.name)
    expect(savedUser.password).not.toBe(validUser.password)
  })
})

//testing the flow generate → hash → compare

describe('POST signup intergration test', () => {
   beforeEach(() => {
    jest.clearAllMocks()
  })

  test("salt is generated correctly", async () => {
    const salt = await generatedSalt()
    expect(typeof salt).toBe('string')
    expect(salt.length).toBeGreaterThan(0)
  })

  test("Passwords are hashed", async () => {
    const salt = await generatedSalt()
    const password = 'Password1234!'
    const hash = await hashPassword(password, salt)

    expect(typeof hash).toBe('string')
    expect(hash).not.toBe(password)
    expect(hash.length).toBeGreaterThan(0)
    
  })

  test("Passwords and hashed passwords are compared correctly", async () => {
    const password = 'Password1234!'
    const salt = await generatedSalt()
    const hash = await hashPassword(password, salt)
    const isMatch = await comparePassword(password, hash)

    expect(isMatch).toBe(true)
  })
})

