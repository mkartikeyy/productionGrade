import { asyncHandler } from "../utils/asyncHandler.js";
import { apierror } from "../utils/apierror.js";
import { apires } from "../utils/apires.js";
import {User} from '../models/user.model.js';
import { cloudinayUpload } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

//creating access and refresh tokens
const genAccessRefreshToken = async (userId)=>
{
  try {
    const user = await User.findById(userId)
    if (!user) {
      throw new apierror(400, "user does not exist")
    }
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})
    return {accessToken, refreshToken};
  } catch (error) {
    throw new apierror(500, "token creation fails")
  }
}

const registerUser = asyncHandler( async(req, res)=>{

    // console.log("body\n",req.body);
    const {username, email, fullName, password} = req.body
    // console.log("username:", email)
    //validation
    if([username, email, fullName, password].some((field)=>field?.trim()===""))
    {
        throw new apierror(400, "all fields are required");
    }
    //checking if the user exists
    const existingUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existingUser){
        throw new apierror(409, "the user already exists")
    }

    //uploading images 
    const avatarImgLocalPath = req.files?.avatar[0]?.path
    // const coverImgLocalPath = req.files?.coverImage[0]?.path

    let coverImgLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImgLocalPath= req.files.coverImage[0].path;
    }

    //check avatar exists or not 
    if(!avatarImgLocalPath){
        throw new apierror(400,"avatar needed")
    }
    
    //uploading on cloud service 
    const avatar = await cloudinayUpload(avatarImgLocalPath)
    const cover = await cloudinayUpload(coverImgLocalPath)
    if(!avatar){ throw new apierror(400, "avatar needed")}

    //creating a user and making an entry in database
    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:cover?.url || "",
        email,
        password, 
        username: username.toLowerCase()
    })
    //checking is user is created
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){throw new apierror(500, "Something went wrong while registering the user")}


    //returning a response after successfull completion of registration
    return res.status(200).json(
        new apires(201, createdUser, "user registered")
    )
})

const loginUser = asyncHandler(async(req,res)=>{
  //destructuring data from the request 
  const {email, username, password} = req.body
  //validations 
  if(!username && !email){
    throw new apierror(400, "username and email needed")
  }
  if(!password){ throw new apierror(401,"password required")}

  //searching in database on either username or email
  const user = await User.findOne({
    $or:[{username}, {email}]
  })
  //checking if user was not there
  if(!user){throw new apierror(404, "User does not exist")}

  //checking if password is correct 
  const userPassValid = await user.isPassCorrect(password)
  if (!userPassValid){throw new apierror(402,"invalid password")}

  //generate tokens using a function 
  const {refreshToken, accessToken} = await genAccessRefreshToken(user._id)

  const loggedInUser = await User.findOne(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  //returning a success response 
  res.status(200)
  .cookie("accessToken",accessToken, options)
  .cookie("refreshToken",refreshToken, options)
  .json(
    new apires(200,{
      user: loggedInUser, accessToken, refreshToken
    },
  "user logged in")
  )
})

const logoutUser = asyncHandler(async (req, res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {new:true}
  )
  const options = {
    httpOnly:true,
    secure:true
  }

  return res.status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new apires(200,{},"user logged out"))
})

const refreshAccessToken = asyncHandler(async (req, res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if(!incomingRefreshToken){throw new apierror(400, "unauthorized request")}

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    if(!decodedToken){throw new apierror(400, "token decoding fails")}
    
    const user = await User.findById(decodedToken?._id)
    if(!user){throw new apierror(400, "unauthorized access, refresh failed")}
  
    if(user?.refreshToken !== incomingRefreshToken){throw new apierror(400, "invalid request")}
  
    const {newRefreshToken, accessToken} = await genAccessRefreshToken(user._id)
  
    const options = {
      httpOnly:true,
      secure: true
    }
  
    res.status(200)
    .cookie("newRefreshToken", newRefreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new apires(
        200,{accessToken, newRefreshToken},
        "session restarted"
      )
    )
  } catch (error) {
    throw new apierror(401, error?.message || "error while refreshing access")
  }

})

export {registerUser, loginUser, logoutUser, refreshAccessToken}


/*
body data: res.body
 [Object: null prototype] {
  fullName: 'charu joshi',
  email: 'cj4567@srmist.edu.inn',
  password: 'charujoshi',
  username: 'cj6969'
}



file data: res.file
 [Object: null prototype] {
  avatar: [
    {
      fieldname: 'avatar',
      originalname: 'WIN_20240624_20_39_58_Pro.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: './public/temp',
      filename: 'avatar',
      path: 'public\\temp\\avatar',
      size: 156347
    }
  ],
  coverImage: [
    {
      fieldname: 'coverImage',
      originalname: 'Screenshot 2024-05-09 115128.png',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: './public/temp',
      filename: 'coverImage',
      path: 'public\\temp\\coverImage',
      size: 417001
    }
  ]
}
 */