const { Server } = require("socket.io");
const cookie=require('cookie')
const jwt=require('jsonwebtoken')
const userModel=require('../models/userModel');
const {generateResponse, generateVector} = require("../Aiservice/aiService");
const messageModel=require('../models/messageModel');
const { createMemory, queryMemory } = require("../service/vectorService");
function initSocketServer(httpServer) {
  const io = new Server(httpServer, { 
    cors: {
      origin: "https://gpt-clone-frontend.onrender.com",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
      credentials: true
    }
   });
  io.use(async (socket,next)=>{
    const  cookies=cookie.parse(socket.handshake.headers?.cookie||"")
    if(!cookies.token){
      return next(new Error("not authorized"))  
    }
    
    try {
      const decoded=jwt.verify(cookies.token,process.env.JWT_SECRET)
      const user=await userModel.findById(decoded.id)
      socket.user=user
      next()
    } catch (error) {
      return next(new Error("not authorized"))
    }
  })
  io.on("connection", (socket) => {
    socket.on("ai-message",async(messagePayload)=>{
      console.log("messagePayload",messagePayload);
      /*const message=await messageModel.create({
        chat:messagePayload.chat,
        user:socket.user._id,
        content:messagePayload.content,
        role:'user'
      })
      const vectors =await generateVector(messagePayload.content)*/
      const [message,vectors]=await Promise.all([
        messageModel.create({
          chat:messagePayload.chat,
          user:socket.user._id,
          content:messagePayload.content,
          role:'user'
        }),
        generateVector(messagePayload.content)
      ])
      const memory= await queryMemory({
        queryVector:vectors,
        limit:10,
        metadata:{
          user:socket.user._id,
        }
      })
      await createMemory({
        vectors,
        messageId:message._id,
        metadata:{
          chat:messagePayload.chat,
          user:socket.user._id,
          text:messagePayload.content
        }
      })
      // console.log(memory);
      const chathistory=await messageModel.find({chat:messagePayload.chat}).sort({createdAt:1}).lean().limit(20)
      const stm=chathistory.map((item)=>{
        return {
          role:item.role,
          parts:[{text:item.content}]
        }
      })
      const ltm=[
        {
          role:'user',
          parts:[
            {
              text:`these are some of our previous conversations that might help you respond better
              ${memory.map((item)=>item.metadata.text).join('\n')}
              `
            }
          ]
        }
      ]
      console.log('Sending to Gemini:', JSON.stringify(stm, null, 2));
      const res=await generateResponse([...ltm,...stm])
      socket.emit("ai-response",{
        content:res,
        chat:messagePayload.chat,
      })
      const [responseMessage,responseVectors]=await Promise.all([
        messageModel.create({
          chat:messagePayload.chat,
          user:socket.user._id,
          content:res,
          role:'model'
        }),
        generateVector(res)
      ])
      await createMemory({
        vectors:responseVectors,
        messageId:responseMessage._id,
        metadata:{
          chat:messagePayload.chat,
          user:socket.user._id,
          text:res
        }
      })
    })
  })
}
module.exports = initSocketServer;
