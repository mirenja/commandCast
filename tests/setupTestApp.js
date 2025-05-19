import { jest } from '@jest/globals'




  
await jest.unstable_mockModule('../config/database.js', () => ({
    default: () => ({})
  }))


const connectToDatabase = (await import('../config/database.js')).default
const makeApp = (await import('../app.js')).default

  
export async function setupTestApp() {
  const mockDb = connectToDatabase()
  const app = makeApp(mockDb)




  return {app}
}

