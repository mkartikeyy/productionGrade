import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const dbconn = async () => {
    try{
        const connInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`\n DB connected!! host: ${connInstance.connection.host}`);
    }
    catch (error) {
        console.log("error: ", error);
        process.exit(1) // code 1: node process fail
    }
}

export default dbconn;


