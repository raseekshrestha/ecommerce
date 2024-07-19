import asyncHandler from "express-async-handler";
import redisClient from "../config/redisConfig.js";
import { productModel } from "../models/products.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getUserCart = async (userId, parseJson = false) => {
    const userCartKeys = await redisClient.keys(`cart:${userId}:*`)
    if (userCartKeys.length == 0) {
        return []
    }
    let cartItems = await redisClient.mget(userCartKeys)
    if (!parseJson) return cartItems
    cartItems = cartItems.map(item => JSON.parse(item))
    return cartItems
}

const addToCart = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const product = await productModel.findOne({ _id: productId }).lean()
    if (!product) throw new ApiError(404, "No such products")

    const saveToCart = await redisClient.set(`cart:${req.user._id}:${productId}`, JSON.stringify(product), "EX", 1209600)

    if (saveToCart) {
        res.status(201).json(new ApiResponse(201, "cart data"))
    } else {
        throw new ApiError(500, "failed to update shopping cart")
    }

})

const getUserCartData = asyncHandler(async (req, res) => {
    const cart = await getUserCart(req.user._id, true)
    res.json(new ApiResponse(200, "Cart Data fetched", cart))
})

const removeFromCart = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const del = await redisClient.del(`cart:${req.user._id}:${productId}`)
    res.status(204).json(new ApiResponse(204, "deleted", del))
})

export { addToCart, getUserCartData, removeFromCart }