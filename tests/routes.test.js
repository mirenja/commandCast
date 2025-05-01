import request from 'supertest'
import app from '../app.js'



  // describe("Test the sessions path", () => {
  //   test("It should return the GET method", async () => {
  //     const response = await request(app).get("/sessions")
  //     expect(response.statusCode).toBe(200)
  //   })
  // })

  // describe("Test the sessions/show path", () => {
  //   test("It should response the GET method", async () => {
  //     const response = await request(app).get("/show")
  //     expect(response.statusCode).toBe(200)
  //   })
  // })

  // describe("Test the dashboard path", () => {
  //   test("It should response the GET method", async () => {
  //     const response = await request(app).get("/dashboard")
  //     expect(response.statusCode).toBe(200)
  //   })
  // })


  // describe("Test the newclient path", () => {
  //   test("It should response the GET method", async () => {
  //     const response = await request(app).get("/newclient")
  //     expect(response.statusCode).toBe(200)
  //   })
  // })

    describe("Test the index page works path", () => {
    test("It should respond to the GET method", async () => {
      const response = await request(app).get("/")
      expect(response.statusCode).toBe(200)
    })
  })
  describe("Test the signup page works path", () => {
    test("It should respond to the GET method", async () => {
      const response = await request(app).get("/signup")
      expect(response.statusCode).toBe(200)
    })
  })

  describe("Test the login POst signup path returns 200OK", () => {
    test("It should respond to the POST method", async () => {
      const response = await request(app).post ("/signup")
      expect(response.statusCode).toBe(302)
    })
  })

  describe("Test the login POst path returns 200OK", () => {
    test("It should respond to the POST method", async () => {
      const response = await request(app).post ("/login")
      expect(response.statusCode).toBe(302)
    })
  })