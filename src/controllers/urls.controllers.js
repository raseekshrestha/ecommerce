import asyncHandler from "express-async-handler";
import { generatePresignedUrl } from "../utils/utils.functions.js";

const getPresignedUrl = asyncHandler(async (req, res) => {
    const { imageFor } = req.query
    const url = generatePresignedUrl(imageFor);
    res.json({ url })

})

export { getPresignedUrl };