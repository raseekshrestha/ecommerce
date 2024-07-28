import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

const generatePresignedUrl = (imgType = "profile") => {
    const timestamp = Math.round((new Date).getTime() / 1000);
    const options = {
        folder: imgType == "profile" ? "ecommerce/profiles/" : "ecommerce/products",
        timestamp: timestamp,
        upload_preset: "ml_default",
    }

    const signature = cloudinary.utils.api_sign_request(options, process.env.CLOUDINARY_API_SECRET);

    return {
        ...options,
        signature,
        api_key: process.env.CLOUDINARY_API_KEY,
        postUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUDNAME}/auto/upload`
    }
}

const generateHmacSignature = (message) => {
    return crypto.createHmac('sha256', process.env.ESEWA_SECRET)
        .update(message)
        .digest('base64')

}

export { generatePresignedUrl, generateHmacSignature }