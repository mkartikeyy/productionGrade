import { apierror } from "../utils/apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJwt = asyncHandler(async(req, _, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new apierror(401, "unauthorized request")
        }
        const decodedAccessToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedAccessToken?._id).select("-password -refreshToken")
        if(!user){
            throw new apierror(401, "invalid token")
        }
        req.user = user; next()
    } catch (error) {
        throw new apierror(400, error?.message || "accessToken invalid")
    }
})