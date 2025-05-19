import connectToDatabase from './config/database.js'
import makeApp from "./app.js"
import { PORT} from './config/app.js'

async function start() {
  const database = connectToDatabase()
  const app = makeApp(database)
  app.listen(PORT, () => console.log(`👋 server started on PORT ${PORT}`))
}

start()

