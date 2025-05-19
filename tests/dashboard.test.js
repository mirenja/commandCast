import request from 'supertest'
import { jest } from '@jest/globals'



const mockClients = [
  {
    id: 'client-1',
    ip_address: '192.168.1.1',
    hostname: 'Client One',
    status: 'online',
    last_seen: new Date().toString(),
  },
  {
    id: 'client-2',
    ip_address: '192.168.1.2',
    hostname: 'Client Two',
    status: 'offline',
    last_seen: new Date().toString(),
  },
  {
    id: 'client-3',
    ip_address: '192.168.1.3',
    hostname: 'Client Three',
    status: 'online',
    last_seen: new Date().toString(),
  },
]


const findMock = jest.fn(() => ({
  sort: () => ({
    limit: () => ({
      skip: () => ({
        exec: () => Promise.resolve(mockClients)
      })
    })
  })
}))

const countDocumentsMock = jest.fn(() => Promise.resolve(mockClients.length))

await jest.unstable_mockModule('../models/client.js', () => ({
  Client: {
    find: findMock,
    countDocuments: countDocumentsMock
  }
}))

await jest.unstable_mockModule('../middlewares/setCurrentUser.js', () => ({
  setCurrentUser: (req, res, next) => {
    const mockUser = { id: '1234tres', username: 'Jane Doey', isAdmin: true }
    req.user = mockUser
    res.locals.loggedInUser = mockUser
    next()
  }
}))


await jest.unstable_mockModule('../middlewares/authenticateToken.js', () => ({
  authenticateToken: (req, res, next) => next()
}))

const { setupTestApp } = await import('./setupTestApp.js')
let app

beforeAll(async () => {
  const setup = await setupTestApp()
  app = setup.app
})

describe('GET /dashboard', () => {
  it('should render dashboard with client stats', async () => {
    // const onlineCount = 2
    // const offlineCount = 1

    const res = await request(app) 
      .get('/dashboard?page=1&limit=2')
      .set('Cookie', ['sessionCookie=mocked-session-id'])

    // if (res.statusCode === 500) {
    //   console.log(res.text)
    // }

    expect(res.statusCode).toBe(200)
    expect(res.text).toContain('General Monitoring')
    expect(findMock).toHaveBeenCalled()
    expect(countDocumentsMock).toHaveBeenCalled()

    expect(res.text).toContain('2 online')
    expect(res.text).toContain('1 Offline')
  })
})


describe('GET /dashboard pagination', () => {
  beforeEach(() => {
    findMock.mockClear()
    countDocumentsMock.mockClear()
  })

  it('renders page 1 with limit 2', async () => {

    findMock.mockImplementationOnce(() => ({
      sort: () => ({
        limit: () => ({
          skip: () => ({
            exec: () => Promise.resolve(mockClients.slice(0, 2))
          })
        })
      })
    }))

    countDocumentsMock.mockResolvedValueOnce(mockClients.length)

    const res = await request(app)
      .get('/dashboard?page=1&limit=2')
      .set('Cookie', ['sessionCookie=mocked-session-id'])

    //console.log(res.text)
    expect(res.text).toContain('Page 1 of 2')

    //  number of client cards rendered 
    const clientCardsCount = (res.text.match(/class="[^"]*\bclient-card\b[^"]*"/g) || []).length
    // console.log("CLIENT CARD COUNT",res.text)
    expect(clientCardsCount).toBe(2)

    // Check online and offline count t
    const onlineCount = mockClients.slice(0, 2).filter(c => c.status === 'online').length
    const offlineCount = mockClients.slice(0, 2).filter(c => c.status === 'offline').length
    expect(res.text).toContain('1 online')
    expect(res.text).toContain('1 Offline')
  })
})