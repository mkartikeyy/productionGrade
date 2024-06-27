import { asyncHandler } from "../utils/asyncHandler.js";
import { apierror } from "../utils/apierror.js";
import { apires } from "../utils/apires.js";
import {User} from '../models/user.model.js';
import { cloudinayUpload } from "../utils/cloudinary.js";

const registerUser = asyncHandler( async(req, res)=>{
    const {username, email, fullName, password} = req.body
    console.log("username:", email)
    //validation
    if([username, email, fullName, password].some((field)=>field?.trim()===""))
    {
        throw new apierror(400, "all fields are required");
    }
    //checking if the user exists
    const existingUser = User.findOne({
        $or: [{username}, {email}]
    })

    if(existingUser){
        throw new apierror(409, "the user already exists")
    }

    //uploading images 
    const avatarImgLocalPath = req.files?.avatar[0]?.path
    const coverImgLocalPath = req.files?.coverImage[0]?.path
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
    const createdUser = await user.findById(user._id).select("-password -refreshToken")
    if(!createdUser){throw new apierror(500, "Something went wrong while registering the user")}


    //returning a response after successfull completion of registration
    return res.status(200).json(
        new apires(201, createdUser, "user registered")
    )
})

export {registerUser}