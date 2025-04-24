import 'dotenv/config'

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI
const SSH_PASSWORD = process.env.SSH_PASSWORD
const username = process.env.username
const TOKEN_SECRET=process.env.TOKEN_SECRET


export{
    PORT,
    MONGODB_URI,
    SSH_PASSWORD,
    username,
    TOKEN_SECRET
}