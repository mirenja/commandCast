import 'dotenv/config'

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI
const SSH_PASSWORD= process.SSH_PASSWORD


export{
    PORT,
    MONGODB_URI,
    SSH_PASSWORD
}