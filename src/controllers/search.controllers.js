import asyncHandler from "express-async-handler";
import { productModel } from "../models/products.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const searchProduct = asyncHandler(async (req, res) => {
    let { q, category, page, productPerPage } = req.query;
    page = Number(page) > 0 ? page : 1;
    productPerPage = Number(productPerPage) ? productPerPage : 10;

    const offset = (page - 1) * productPerPage

    const filterQuery = {
        $or: [
            { name: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } }
        ]
    }
    if (category) filterQuery.category = category

    const products = await productModel.find(filterQuery).skip(offset).limit(productPerPage).sort({ createdAt: -1 })
    res.json(new ApiResponse(200, "search result", products))

})

export { searchProduct }