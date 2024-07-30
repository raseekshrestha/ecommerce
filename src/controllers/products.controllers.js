import asyncHandler from "express-async-handler";
import { productModel } from "../models/products.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { categoryModel } from "../models/category.model.js";
import redisClient from "../config/redisConfig.js";


const addProduct = asyncHandler(async (req, res) => {
    const { name, description, image_urls, thumbnail_url, price, stock, discount, category } = req.body;
    const categoryExists = await categoryModel.countDocuments({ _id: category })
    if (!categoryExists) {
        throw new ApiError(404, "provided category does not exists")
    }

    const product = await productModel.create({
        name, description,
        image_urls, thumbnail_url,
        price,
        stock: stock || Infinity,
        discount,
        seller: req.user._id
        , category
    })

    if (product) {
        res.json(new ApiResponse(201, "Product added successfully", product))
    } else {
        throw new ApiError(500, "Could not add product")
    }

})

const getProductById = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const product = await productModel.findOne({ _id: productId }).populate([{
        path: "seller",
        select: "username"
    },
    {
        path: "category",
        select: "name"
    }
    ])
    if (product) {
        await redisClient.zincrby("products", 1, productId)
        res.json(new ApiResponse(200, "product fetched", product))
    } else {
        throw new ApiError(500, "failed to fetch")
    }
})

const updateProductById = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const { name, description, image_urls, thumbnail_url, price, stock, discount } = req.body;
    const updates = {}

    if (name) updates.name = name;
    if (description) updates.description = description;
    if (image_urls) updates.image_urls = image_urls;
    if (thumbnail_url) updates.thumbnail_url = thumbnail_url;
    if (price) updates.price = price;
    if (stock) updates.stock = stock;
    if (discount) updates.discount = discount;


    if (Object.keys(updates).length == 0) {
        throw new ApiError(400, "Do you even want to update anything?")
    }
    const checks = await productModel.findOne({ _id: productId, seller: req.user._id })
    if (!checks) {
        throw new ApiError(403, "Not your product to update")
    }

    const product = await productModel.findOneAndUpdate(
        { _id: productId },
        { $set: updates },
        { new: true }
    );
    if (!product) {
        throw new ApiError(404, "product not found")
    }
    res.json(new ApiResponse(200, "updated", product))

})

const deleteProductById = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const checks = await productModel.findOne({ _id: productId, seller: req.user._id })
    if (!checks) {
        throw new ApiError(403, "Not your product to delete or already Deleted")
    }

    try {
        const del = await productModel.deleteOne({ _id: productId })
        res.json(new ApiResponse(200, del.deletedCount > 0 ? "deleted" : "failed to delete. does this product even exists?", del))
    }
    catch (err) {
        throw new ApiError(500, "Could not delete" + err.message)
    }


})


const getTopXProductsByViews = (x) => asyncHandler(async (req, res) => {
    try {
        const topX = await redisClient.zrevrange("products", 0, x - 1, "WITHSCORES")
        const productWithScore = [];

        for (let i = 0; i < topX.length; i += 2) {
            productWithScore[topX[i]] = topX[i + 1]
        }
        const products = await productModel.find({ _id: { $in: Object.keys(productWithScore) } }).populate([{
            path: "seller",
            select: "username email"
        },
        {
            path: "category",
            select: "name"
        }
        ]).lean()

        // add views into each products and sort them by views desc, popular first
        const sortedProducts = products.map(product => {
            const obj = { ...product, views: productWithScore[product._id] }
            return obj
        }).sort((p1, p2) => p2.views - p1.views)

        res.json(new ApiResponse(200, "popular products", sortedProducts))
    } catch (err) {

        throw new ApiError(500, err.message)
    }
})



export { addProduct, getProductById, updateProductById, deleteProductById, getTopXProductsByViews }