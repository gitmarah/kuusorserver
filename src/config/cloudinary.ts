import {v2 as cloudinary, type UploadApiErrorResponse, type UploadApiResponse} from "cloudinary";
import { configDotenv } from "dotenv";
import streamifier from "streamifier";


configDotenv()


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET! });



const uploadFile = (buffer: Buffer, folder: string): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {folder, resource_type: "auto"},
            (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
                if(error) reject(error)
                else if (result) resolve(result)
                else reject(new Error("Upload failed with no response!"));
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    }); }



const deleteExistingFile = async (oldPublicId: string) => {
    try{
        await cloudinary.uploader.destroy(oldPublicId);
    } catch(err) {
        console.log(err);
    } }


    
const handleUpload = async (buffer: Buffer, folder: string, oldPublicId: string | null) => {
    try{
        const result = await uploadFile(buffer, folder);
        if(oldPublicId && result.public_id){
            await deleteExistingFile(oldPublicId);
        }
        return result;
    } catch(err){
        console.log(err);
    } }



export default handleUpload;