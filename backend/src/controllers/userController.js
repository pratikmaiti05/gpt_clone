const userModel=require('../models/userModel')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
const upload=require('../storage/storageService')
async function registerUser(req,res) {
  try {
    const {username,email,password}=req.body
    let image=null
    if(req.file){
      image=await upload(req.file)
    }
    const isUser=await userModel.findOne({email})
    if(isUser){
      return res.status(400).json({message:"User already exists"})
    }
    if(!username || !email || !password){
      return res.status(400).json({message:"All fields are required"})
    }
    const user=await userModel.create({
      username,email,
      password:await bcrypt.hash(password,10),
      profilePicture:image?.url||""
    })
    const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
    res.cookie('token',token,{
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 2 * 24 * 60 * 60 * 1000
    })
    res.status(201).json({
      message:"user created",
      user
    })
  } catch (error) {
    console.log(error);
  }
}
async function loginUSer(req,res) {
  try {
    const {email,password}=req.body
    if(!email||!password){
      return res.status(400).json({message:"All fields are required"})
    }
    const user=await userModel.findOne({email})
    if(!user){
      return res.status(400).json({message:"User does not exist"})
    }
    const isPasword=await bcrypt.compare(password,user.password)
    if(!isPasword){
      return res.status(400).json({message:"Invalid credentials"})
    }
    const token=jwt.sign({id:user._id},process.env.JWT_SECRET)
    res.cookie('token',token,{
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 2 * 24 * 60 * 60 * 1000
    })
    res.status(201).json({
      message:"user loggedIn",
      user
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({message:"Server error"})
  }
}
async function logoutUser(req,res){
  res.cookie('token',null,{
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(Date.now())
  })
  res.status(200).json({
    message:"user logged out"
  })
}
module.exports={registerUser,loginUSer,logoutUser}