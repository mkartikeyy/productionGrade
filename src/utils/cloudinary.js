import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary';


cloudinary.config({
    cloud_name: process.env.CCLOUD_NAME, 
    api_key: process.env.CAPI_KEY, 
    api_secret: process.env.CAPI_SECRET
});

const cloudinayUpload = async(localPath)=>{
    try {
        if(!localPath) return null;
        //path valid
        const res = await cloudinary.uploader.upload(localPath,{resource_type: "auto"})
        //file uploaded successfully
        console.log("file upload complete!: ", res.url);
        return res;
    } catch (error) {
        fs.unlink(localPath)//removing the local file if not uploaded 
        return null;
    }
}

export {cloudinayUpload}