import 'dotenv/config'

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI
const PRIVATE_KEY_PATH= process.env.PRIVATE_KEY_PATH


export{
    PORT,
    MONGODB_URI,
    PRIVATE_KEY_PATH
}