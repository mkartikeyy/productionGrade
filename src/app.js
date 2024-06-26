import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

//router import
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users",userRouter)

export {app}