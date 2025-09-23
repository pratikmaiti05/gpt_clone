const chatModel=require('../models/chatModel')
const messageModel=require('../models/messageModel')
async function createChat(req,res) {
  const {title}=req.body
  const user=req.user
  const chat=await chatModel.create({
    user:user._id,
    title
  })
  res.status(201).json({
    message:"Chat created",
    chat:{
      _id:chat._id,
      title:chat.title,
      lastActivity:chat.lastActivity,
      user:{
        _id:user._id
      }
    }
  })
}
async function getChats(req, res) {
  try {
    const user = req.user;
    const chats = await chatModel.find({ user: user._id }).sort({ lastActivity: -1 });
    res.status(200).json({
      message:"Chats fetched",
      chats: chats.map((chat)=>({
        _id: chat._id,
        title: chat.title,
        lastActivity: chat.lastActivity,
        user:chat.user
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
async function getMessages(req,res) {
  const chatId=req.params.id
  const messages=await messageModel.find({chat:chatId}).sort({createdAt:1})
  res.status(200).json({
    message:"Messages fetched",
    messages
  })
}
module.exports={createChat,getChats,getMessages}