import { jest } from '@jest/globals'
import puppeteer from 'puppeteer'
import { setupTestApp } from '../tests/setupTestApp.js'
import http from 'http'

let server, browser, page
jest.setTimeout(60000) 
const BASE_URL = 'http://localhost:3001'

beforeAll(async () => {
  const { app } = await setupTestApp()

  server = http.createServer(app)
  await new Promise(resolve => server.listen(3001, resolve))

  browser = await puppeteer.launch({
    headless: 'new', 
    args: ['--no-sandbox']
  })
  page = await browser.newPage()
})

afterAll(async () => {
  await browser.close()
  await new Promise(resolve => server.close(resolve))
})

describe('User signup and login flow (E2E)', () => {
  const testUser = {
    name: 'Test User',
    email: `testuser@test.com`,
    password: 'Password1234!'
  }

  test('User can sign up via form', async () => {
     
    await page.goto(`${BASE_URL}/signup`)

  
    await page.type('input[name="name"]', testUser.name)
    await page.type('input[name="email"]', testUser.email)
    await page.type('input[name="password"]', testUser.password)
    await page.type('input[name="confirm_password"]', testUser.password)

   
    await Promise.all([
      page.waitForNavigation(),
      page.click('button')
    ])

    const url = page.url()
    expect(url).toMatch(/\/\?message=User\+added\+successfully/)
  })

  test('User can log in after signing up', async () => {
    await page.goto(`${BASE_URL}/`)

    await page.type('input[name="email"]', testUser.email)
    await page.type('input[name="password"]', testUser.password)

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('button') 
    ])

   
    const url = page.url()
    expect(url).not.toContain('/login')
    expect(url).toMatch(/\/dashboard/)
  })
})
