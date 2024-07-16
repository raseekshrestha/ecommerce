import mongoose, { Schema, model } from "mongoose";

const reviewSchema = Schema({
    rated_by: {
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

reviewSchema.index({ rated_by: 1, product: 1 }, { unique: true });

const reviewModel = model("Rating", reviewSchema);

export { reviewModel }

