import asyncHandler from "express-async-handler";
import { categoryModel } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createCategory = asyncHandler(async (req, res) => {
    let { name, parent } = req.body;
    try {
        if (parent) {
            const exists = await categoryModel.countDocuments({ _id: parent })
            if (!exists)
                throw new ApiError(404, "provided category parent not found")
        }
        const newCategory = await categoryModel.create({ name, parent })

        res.json(new ApiResponse(201, `${parent ? "sub" : ""}category created`, newCategory))
    } catch (error) {
        if (error.code == 11000) {
            throw new ApiError(400, "Category name already exists")
        }
        throw new ApiError(500, error.message)
    }
})

const getGroupedCategories = async (parentCategory = null) => {
    const result = [];
    const mainCategories = await categoryModel.find({ parent: parentCategory }).select("name parent")

    for (let mainCategory of mainCategories) {
        const subCatObject = {
            ...mainCategory._doc,
        }
        const subCategories = await getGroupedCategories(mainCategory._id)
        subCatObject.subCategories = subCategories
        result.push(subCatObject)
    }
    return result;
}

const getCategories = asyncHandler(async (req, res) => {
    const categories = await getGroupedCategories()
    res.json(new ApiResponse(200, "categories", categories))
})

export { createCategory, getCategories }