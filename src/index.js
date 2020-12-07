// express to connect server and client
const express= require('express')
require('./db/mongoose')
const userrouter= require('./routers/user')
const taskrouter =require('./routers/task')
const cors=require('cors')


const app =express()
app.use(cors())
app.options('*', cors())
const port= process.env.PORT 


app.use(express.json())
app.use(userrouter)
app.use(taskrouter)



app.listen(port,()=>{
    console.log('server is up on '+ port)
})
