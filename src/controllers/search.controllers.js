import asyncHandler from "express-async-handler";
import { productModel } from "../models/products.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const countProductsWithFiler = async (filter) => {
    return await productModel.countDocuments(filter)
}

const searchProduct = asyncHandler(async (req, res) => {
    let {
        q, category, seller,
        page, productPerPage,
        priceGreaterThan, priceLessThan,
        ratingOver, ratingBelow
    } = req.query;

    if (ratingBelow && ratingOver) {
        throw new ApiError(400, "cannot select both ratingBelow and ratingOver")
    }

    page = Number(page) > 0 ? page : 1;
    productPerPage = Number(productPerPage) ? productPerPage : 10;
    q = q || "";
    priceGreaterThan = Number(priceGreaterThan) || 0;
    priceLessThan = Number(priceLessThan) || Infinity;

    const offset = (page - 1) * productPerPage

    const filterQuery = {
        $or: [
            { name: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } }
        ],
        price: {
            $gte: priceGreaterThan,
            $lte: priceLessThan
        }
    }
    if (category) filterQuery.category = category
    if (seller) filterQuery.seller = seller
    if (ratingBelow) {
        filterQuery.averageRating = {
            $lte: ratingBelow
        }
    }
    if (ratingOver) {
        filterQuery.averageRating = {
            $gte: ratingOver
        }
    }
    const totalProducts = await countProductsWithFiler(filterQuery)
    if (totalProducts == 0) {
        throw new ApiError(404, "0 result found")
    }

    // applies filter ,pagination and sort product by created date (latest first)
    const products = await productModel.find(filterQuery).skip(offset).limit(productPerPage).sort({ createdAt: -1 })

    res.json(new ApiResponse(200, "search result", { products, totalProducts, page, productPerPage }))

})

export { searchProduct }