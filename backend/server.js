require('dotenv').config()
const app=require('./src/app')
const connectDB = require('./src/db/db')
const { createServer } = require("http");
const initSocketServer=require('./src/sockets/socketServer')
const httpServer = createServer(app);
const PORT=process.env.PORT||3000
connectDB()
initSocketServer(httpServer)
httpServer.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})