import { Schema, model } from "mongoose";


const productSchema = Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image_urls: {
        type: [String],
        required: true
    },
    thumbnail_url: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        require: true,
    },
    stock: {
        type: Number,
    },
    discount: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number
    },
    totalReview: {
        type: Number,
        default: 0
    }

}, { timestamps: true })

const productModel = model("Product", productSchema);

export { productModel }