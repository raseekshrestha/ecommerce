import { Schema, model } from "mongoose";

const couponSchema = Schema({
    code: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    discount: {
        type: Number,
        required: true,
        min: [1, "Must be at least 1% discount"],
        max: [100, "Max 100% discount allowed"]
    },
    validity: {
        type: Date
    },
    maxUse: {
        type: Number
    },
    totalUse: {
        type: Number
    }
},
    {
        timestamps: true
    })

const couponModel = model("Coupon", couponSchema)

export { couponModel }