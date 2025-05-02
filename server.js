import app from "./app.js"
import { PORT} from './config/app.js'

app.listen(PORT, () =>{
    console.log(`👋 server started on PORT ${PORT}`)
})



