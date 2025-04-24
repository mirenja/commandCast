// Integration tests for verifying custom model functions work as intended.

import  {MongoClient} from 'mongodb'

describe('insert', () => {
    let connection
    let db

    beforeAll(async () => {
        connection = await MongoClient.connect(global.__MONGO_URI__, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        db = await connection.db(globalThis.__MONGO_DB_NAME__);
      })

    afterAll(async () => {
      await connection.close();
    })

    it('should insert a  doc into collection', async () => {
        const clients = db.collection('clients')
    
    const mockClient = {_id: '6805f9bd', name: 'host-19' , mac_address:"83:9f:97:c9:48:ed" ,ip_address:"209.193.129.53", status:"offline"}
    await clients.insertOne(mockClient)

    const insertedClient = await clients.findOne({_id: '6805f9bd'})
    expect(insertedClient).toEqual(mockClient)
    })
})