const express=require('express')
const router=express.Router()
const multer=require('multer')
const { registerUser, loginUSer, logoutUser } = require('../controllers/userController')
const isLoggedIn = require('../middlewares/isLoggedIn')
const upload=multer({storage:multer.memoryStorage()})
router.post('/register',upload.single('profilePicture'),registerUser)
router.post('/login',loginUSer)
router.get('/logout',logoutUser)
router.get('/me',isLoggedIn,(req,res)=>{
  res.status(200).json({
    success:true,
    user:{
      id:req.user._id,
      username:req.user.username,
      email:req.user.email,
      profilePicture:req.user.profilePicture
    }
  })
})
module.exports=router