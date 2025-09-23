const express=require('express')
const router=express.Router()
const  isLoggedIn  = require('../middlewares/isLoggedIn')
const { createChat,getChats,getMessages } = require('../controllers/chatController')
router.post('/create-chat',isLoggedIn,createChat)
router.get('/getChats',isLoggedIn,getChats)
router.get('/messages/:id',isLoggedIn,getMessages)
module.exports=router