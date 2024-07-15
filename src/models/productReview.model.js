import mongoose, { Schema, model } from "mongoose";

const reviewSchema = Schema({
    reviewer: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product"
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    }
})

const reviewModel = model("Rating", reviewSchema);

export { reviewModel }

