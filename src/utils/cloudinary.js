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
        // console.log("file upload complete!: ", res.url);
        fs.unlinkSync(localPath);
        return res;
    } catch (error) {
        fs.unlink(localPath)//removing the local file if not uploaded 
        return null;
    }
}

export {cloudinayUpload}



/* SAMPLE CLOUDINARY RESPONSE
response from cloudinary
:  {
  asset_id: '54d9c38b0d2a6ff83e6d5ab8cad7487f',
  public_id: 'mbxjqhnc9cobgahsuefi',
  version: 1719470574,
  version_id: '83fc7adeda1f96bb2b63f3511313ebc2',
  signature: 'dbcee2c1d9c33bb99b293060626b060e70b45dd5',
  width: 1284,
  height: 925,
  format: 'png',
  resource_type: 'image',
  created_at: '2024-06-27T06:42:54Z',
  tags: [],
  bytes: 417001,
  type: 'upload',
  etag: 'b37e04b4078b17cd9383a0493448b085',
  placeholder: false,
  url: 'http://res.cloudinary.com/learing/image/upload/v1719470574/mbxjqhnc9cobgahsuefi.png',
  secure_url: 'https://res.cloudinary.com/learing/image/upload/v1719470574/mbxjqhnc9cobgahsuefi.png',
  asset_folder: '',
  display_name: 'mbxjqhnc9cobgahsuefi',
  original_filename: 'coverImage',
  api_key: '857785559785639'
}
*/