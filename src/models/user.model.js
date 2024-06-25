import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username:{
            type: string,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
            index: true
        },
        email:{
            type: string,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName:{
            type: string,
            required: true,
            lowecase: true,
            trim: true,
            index:true
        },
        avatar:{
            type:string, //cloud storage
            required: true
        },
        coverImage:{
            type:string, //cloud storage
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:string,
            required:[true, "pass req"]
        },
        refreshToken:{
            type:string
        }
    },{
        timestamps:true
    }
)

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password=bcrypt.hash(this.password, 10)
    next()
})
userSchema.methods.isPassCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken=function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}
  
export const User = mongoose.model("User",userSchema)