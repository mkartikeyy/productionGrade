import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: true, limit: "16kb"}))

//router import
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users",userRouter)

export {app}