
import {MongoClient} from 'mongodb'


let connection
let db

export async function connectTestDB() {
 connection = await MongoClient.connect(globalThis.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    db = await connection.db(globalThis.__MONGO_DB_NAME__)
  }

export async function closeTestDB() {
 await connection.close()
}


beforeAll(async () => {
  await connectTestDB()
})

afterAll(async () => {
  await closeTestDB()
})
