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


  describe("Test the newclient path", () => {
    test("It should response the GET method", async () => {
      const response = await request(app).get("/newclient")
      expect(response.statusCode).toBe(200)
    })
  })