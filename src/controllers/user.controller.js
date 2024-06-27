import { asyncHandler } from "../utils/asyncHandler.js";
import { apierror } from "../utils/apierror.js";
import { apires } from "../utils/apires.js";
import {User} from '../models/user.model.js';
import { cloudinayUpload } from "../utils/cloudinary.js";

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

export {registerUser}


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