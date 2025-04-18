import express from 'express'
import mongoose from 'mongoose'

const app =express()
const PORT = 4000


mongoose.connect('mongodb://127.0.0.1:27017/commandcast')
  .then(() => console.log('💽 Database connected'))
  .catch(error => console.error(error))

//schemas

const userSchema = new mongoose.Schema()



app.get('/', (request, response) => {
    response.send('login')
})

app.post('/',(request,response) =>{
    response.send('login')
} )

app.get('/admin', (request,response) => {
    response.send('session')
})

app.get('/sessions', (request,response) => {
    response.send('session')
})






app.listen(PORT, () =>{
    console.log(`👋 server started on PORT ${PORT}`)
})