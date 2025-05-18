import { jest } from '@jest/globals'
import request from 'supertest'

const saveMock = jest.fn().mockResolvedValue(true)
const uuidv4Mock = jest.fn().mockReturnValue('mocked-uuid')
const findMock = jest.fn()
const findOneMock = jest.fn()
const findOneAndUpdateMock = jest.fn()
const findByIdAndDeleteMock = jest.fn()

await jest.unstable_mockModule('../models/client.js', () => {
  const ClientMock = function (clientData) {
    return {
      ...clientData,
      save: saveMock,
    }
  }

  ClientMock.find = findMock
  ClientMock.findOne = findOneMock
  ClientMock.findOneAndUpdate = findOneAndUpdateMock
  ClientMock.findByIdAndDelete = findByIdAndDeleteMock

  return {
    Client: ClientMock
  }
})


jest.unstable_mockModule('uuid', () => ({
  v4: uuidv4Mock
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

describe('POST /newclient', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should fail when IP address is invalid', async () => {
    const res = await request(app)
      .post('/newclient')
      .send({
        name: 'Device1',
        mac_address: '00:11:22:33:44:55',
        ip_address: 'invalid-ip'
      })

    expect(res.status).toBe(302)
    expect(res.headers['location']).toMatch('/dashboard?message=Invalid%20IP%20address')
    expect(saveMock).not.toHaveBeenCalled()
  })

  it('should add client successfully with valid data', async () => {
    const res = await request(app)
      .post('/newclient')
      .send({
        name: 'Router1',
        mac_address: 'AA:BB:CC:DD:EE:FF',
        ip_address: '192.168.1.1' 
      })

    expect(res.status).toBe(302)
    expect(res.headers['location']).toBe('/dashboard?message=Device+added+successfully')
    expect(saveMock).toHaveBeenCalled()
    expect(uuidv4Mock).toHaveBeenCalled()
  })
})



describe('GET /clients', () => {
  it('should render clients list', async () => {
    findMock.mockResolvedValue([{ name: 'Client1' }, { name: 'Client2' }])

    const res = await request(app)
      .get('/clients')
      .set('Cookie', ['sessionCookie=session123'])

    expect(res.status).toBe(200)
    expect(findMock).toHaveBeenCalled()
    expect(res.text).toMatch(/Client1/)
  })
})

describe('GET /clients/:client_id', () => {
  it('should render a single client detail page', async () => {
    findOneMock.mockResolvedValue({ name: 'Client1', _id: '0e9df9f4b6e9' })

    const res = await request(app)
      .get('/clients/0e9df9f4b6e9')
      .set('Cookie', ['sessionCookie=session456'])

    expect(res.status).toBe(200)
    expect(findOneMock).toHaveBeenCalledWith({ _id: '0e9df9f4b6e9' })
    expect(res.text).toMatch(/Client1/)
  })
})

describe('POST /clients/:client_id/update route', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should update a client and redirect', async () => {
    const updatedClient = { _id: '0e9df9f4b6e9', name: 'UpdatedName', ip_address: '192.168.0.2' }
    findOneAndUpdateMock.mockResolvedValue(updatedClient)

    const res = await request(app)
      .post('/clients/0e9df9f4b6e9/update')
      .send({ name: 'UpdatedName', ip_address: '192.168.0.2' })
      .set('Cookie', ['sessionCookie=session789'])

    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { _id: '0e9df9f4b6e9' },
      { name: 'UpdatedName', ip_address: '192.168.0.2' },
      { new: true }
    )
    expect(res.status).toBe(302)
    expect(res.headers['location']).toBe('/clients')
  })

})

describe('POST /clients/:client_id/delete', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should delete a client and redirect', async () => {
    findByIdAndDeleteMock.mockResolvedValue({})

    const res = await request(app)
      .post('/clients/0e9df9f4b6e9/delete')
      .set('Cookie', ['sessionCookie=session789'])

    expect(findByIdAndDeleteMock).toHaveBeenCalledWith('0e9df9f4b6e9')
    expect(res.status).toBe(302)
    expect(res.headers['location']).toBe('/clients')
  })
})

