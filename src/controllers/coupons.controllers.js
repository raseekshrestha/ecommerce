import asyncHandler from "express-async-handler";
import { couponModel } from "../models/coupons.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createCoupon = asyncHandler(async (req, res) => {
    let { coupon, discount, validityStart, validityEnd, maxUse } = req.body;

    const useDateValidity = Boolean(validityStart || validityEnd)

    const createdCoupon = await couponModel.create({
        code: coupon,
        discount,
        useDateValidity,
        validityStart,
        validityEnd,
        maxUse,

    })
    res.json(new ApiResponse(201, `coupon: ${coupon} created with discount: ${discount}`, createdCoupon))

})

const removeCoupon = asyncHandler(async (req, res) => {
    const coupon = req.params.coupon;
    console.log(coupon)
    const del = await couponModel.deleteOne({ code: coupon })
    console.log(del)
    res.json(new ApiResponse(204, "deleted", del))
})


export { createCoupon, removeCoupon };
