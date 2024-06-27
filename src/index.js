import dotenv from 'dotenv'
import dbconn from "./db/dataconn.js";
import {app} from './app.js'

dotenv.config({
    path: './.env'
})

dbconn()
.then(()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log("listening on port: ", process.env.PORT)
    })
})
.catch((err)=>{
    console.log("MongoDB conn error", err)
})