const express=require('express')
const app=express()
const cookieParser=require('cookie-parser')
const userRoute=require('./routes/userRoute')
const chatRoute=require('./routes/chatRoutes')
const cors = require('cors');
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
  ],
  credentials: true
}));
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use('/auth',userRoute)
app.use('/chat',chatRoute)
module.exports=app
