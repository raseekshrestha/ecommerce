import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/ApiError.js";
import { generateHmacSignature } from "../utils/utils.functions.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { txnModel } from "../models/transactions.model.js";

const esewaSuccess = asyncHandler(async (req, res) => {
    const data = req.query.data;
    if (!data) {
        throw new ApiError(400, "not redirected from esewa")
    }
    try {
        const d64decoded = JSON.parse(atob(data))

        const message = d64decoded.signed_field_names.split(",").map(field => `${field}=${d64decoded[field]}`).join(",")
        const calcSignature = generateHmacSignature(message)

        // compare computed signature with the singature sent by esewa signed by our key
        if (calcSignature != d64decoded.signature) {
            throw new ApiError(400, "Invalid Signature. Couldn't validate transaction")
        }
        const txn = await txnModel.create({
            transactionCode: d64decoded.transaction_code,
            status: d64decoded.status,
            totalAmount: d64decoded.total_amount,
            transactionUuid: d64decoded.transaction_uuid,
            productCode: d64decoded.product_code,
            signature: d64decoded.signature
        })

        res.redirect(process.env.FRONTEND_URL);

    } catch (error) {
        throw new ApiError(400, error.message)
    }

})

const esewaFailure = asyncHandler(async (req, res) => {

})
export { esewaSuccess, esewaFailure }