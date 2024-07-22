import asyncHandler from "express-async-handler";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { couponModel } from "../models/coupons.models.js";
import { productModel } from "../models/products.model.js";
import { mongoose } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { generateHmacSignature } from '../utils/utils.functions.js';
import { orderModel } from "../models/orders.model.js";



const createOrder = asyncHandler(async (req, res) => {
    const { items, coupon, shippingAddress } = req.body;
    if (!shippingAddress)
        throw new ApiError(400, "shipping address required")

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
    let orderItems = []

    // calculate total price, while doing that create orderItems for orders
    let totalPrice = products.reduce((total, product) => {
        const quantity = items.find(item => item._id == product._id).quantity
        orderItems.push({
            productId: product._id,
            quantity: quantity,
            price: product.price * quantity
        })
        return total + product.price * quantity;
    }, 0)

    // apply discount
    totalPrice = totalPrice - (discount / 100) * totalPrice;

    const order = await orderModel.create({
        user: req.user._id,
        items: orderItems,
        totalAmount: totalPrice,
        status: "PENDING",
        paymentMethod: "Esewa",
        shippingAddress,

    })

    const esewaForm = {
        amount: totalPrice,
        tax_amount: 0,
        total_amount: totalPrice,
        transaction_uuid: uuidv4(),
        product_code: "EPAYTEST",
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: process.env.BACKEND_URL + "/api/payment/esewasuccess",
        failure_url: process.env.BACKEND_URL + "/api/payment/esewafailure",
        signed_field_names: "total_amount,transaction_uuid,product_code",
    };

    const message = `total_amount=${totalPrice},transaction_uuid=${esewaForm.transaction_uuid},product_code=${esewaForm.product_code}`
    esewaForm.signature = generateHmacSignature(message)

    if (order) {
        res.json(new ApiResponse(200, "producstr", esewaForm))
    } else {
        throw new ApiError(500, "Order creation failed")
    }
})


const getAllOrders = asyncHandler(async (req, res) => {
    // p = page number , n = number of order per page
    let { p, n } = req.query
    //10 order per page by default and page number 1 if not specified
    p = (p && p >= 0) ? p : 1;
    n = n ? n : 10;
    const offset = (p - 1) * n;
    const orders = await orderModel.find({ user: req.user._id }).skip(offset).limit(n);

    const totalOrders = await orderModel.countDocuments({ user: req.user._id })

    const totalPages = Math.ceil(totalOrders / n)

    res.json(new ApiResponse(200, `page ${p} of orders`, { orders, totalPages }))
})

const cancelOrder = asyncHandler(async (req, res) => {
    const orderId = req.params.orderId;
    const order = await orderModel.findOne({ _id: orderId })
    if (!order)
        throw new ApiError(404, "that order does not exists");
    if (order.user != req.user._id)
        throw new ApiError(403, "Not your order")
    if (order.status == "DELIVERED")
        throw new ApiError(400, "product already delivered")

    const update = await orderModel.findOneAndUpdate(
        { _id: orderId, user: req.user._id },
        { $set: { status: "CANCELLED" } },
        { new: true }
    )

    res.json(new ApiResponse(200, "order cancelled", update))
})

const completeOrder = asyncHandler(async (req, res) => {
    const orderId = req.params.orderId;

    const order = await orderModel.findOne({ _id: orderId });
    if (order.status == "CANCELLED")
        throw new ApiError(400, "order had already been cancelled")

    order.status = "DELIVERED";
    await order.save();

    res.json(new ApiResponse(200, "update: order completed", order))

})


export { createOrder, getAllOrders, cancelOrder, completeOrder }