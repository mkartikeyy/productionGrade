import dotenv from 'dotenv'
import dbconn from "./db/dataconn.js";

dotenv.config({
    path: './env'
})

dbconn()