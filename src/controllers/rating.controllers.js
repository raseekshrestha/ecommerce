import asyncHandler from "express-async-handler";
import { reviewModel } from "../models/productReview.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { productModel } from "../models/products.model.js";


const addRating = asyncHandler(async (req, res) => {
    const productId = req.params.productId
    const { star } = req.body;
    // creates new rating record if not exists
    const oldRating = await reviewModel.findOne({ product: productId, rated_by: req.user._id });
    const product = await productModel.findOne({ _id: productId });
    let newAvgRating;
    if (!oldRating) {
        const newRating = await reviewModel.create({ product: productId, rated_by: req.user._id, rating: star })
        newAvgRating = ((product.averageRating * product.totalReview) + star) / (product.totalReview + 1)
        product.totalReview = product.totalReview + 1;

    } else {
        if (oldRating.rating == star) return res.json(new ApiResponse(200, "Same Rating?"))
        // if user has already rated this product just update the product
        const updateRating = await reviewModel.updateOne({ _id: oldRating._id }, { rating: star })
        newAvgRating = ((product.averageRating * product.totalReview - oldRating.rating + star) / product.totalReview)
    }

    product.averageRating = newAvgRating;

    const saved = await product.save()
    if (oldRating) {
        res.json(new ApiResponse(201, "Rating Saved!", saved))
    }
    else {
        res.json(new ApiResponse(200, "Rating updated!", saved))
    }


})

const getUserRatings = asyncHandler(async (req, res) => {
    const myRatings = await reviewModel.find({ rated_by: req.user._id })
    res.json(new ApiResponse(200, "Here are your ratings.", myRatings))
})

export { addRating, getUserRatings }