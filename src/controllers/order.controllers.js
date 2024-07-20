import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { couponModel } from "../models/coupons.models.js";
import { productModel } from "../models/products.model.js";
import { mongoose } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const generateSignature = (message) => {
    return crypto.createHmac('sha256', process.env.ESEWA_SECRET)
        .update(message)
        .digest('base64')

}

const createOrder = asyncHandler(async (req, res) => {
    const { items, coupon } = req.body;
    if (items.length == 0)
        throw new ApiError(400, "ordering 0 products?")

    let discount = 0;

    if (coupon) {
        const dbCoupon = await couponModel.findOne({ code: coupon })

        // if validity is present check if coupon is expired
        // if not set then coupon will not expire
        if (dbCoupon.validity && (Date.now() > dbCoupon.validity)) {
            throw new ApiError(400, "Coupon Expired");
        }

        // if maxUse is present check if coupon is used maxUse times
        if (dbCoupon.maxUse && (dbCoupon.totalUse > dbCoupon.maxUse)) {
            throw new ApiError(400, "Coupon max use limit reached")
        } else {
            dbCoupon.totalUse += 1;
            await dbCoupon.save()
        }

        // now coupon is valid
        discount = dbCoupon.discount
    }

    const ids = items.map(item => new mongoose.Types.ObjectId(item._id))
    const products = await productModel.find({ _id: { $in: ids } }).lean()

    let totalPrice = products.reduce((total, product) => total + product.price, 0)

    // apply discount
    totalPrice = totalPrice - (discount / 100) * totalPrice

    const esewaForm = {
        amount: totalPrice,
        tax_amount: 0,
        total_amount: totalPrice,
        transaction_uuid: uuidv4(), // You need to set this dynamically or based on your requirement
        product_code: "EPAYTEST",
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: process.env.BACKEND_URL + "/api/payment/esewasuccess",
        failure_url: process.env.BACKEND_URL + "/api/payment/esewafailure",
        signed_field_names: "total_amount,transaction_uuid,product_code",
    };

    const message = `total_amount=${totalPrice},transaction_uuid=${esewaForm.transaction_uuid},product_code=${esewaForm.product_code}`
    esewaForm.signature = generateSignature(message)


    res.json(new ApiResponse(200, "producstr", esewaForm))



})

export { createOrder }