import { Schema, model } from "mongoose";

const orderSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    items: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
        default: "PENDING"
    },
    paymentMethod: {
        type: String,
        enum: ["Esewa", "Khalti", "Cash On Delivery"],
        required: true
    },
    deliveryDate: {
        type: Date
    },
    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },
        addressLine1: {
            type: String,
            required: true
        },
        addressLine2: {
            type: String
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    },
    note: {
        type: String
    },
    transaction: {
        type: Schema.Types.ObjectId,
        ref: "Transaction"
    },
}, { timestamps: true })



const orderModel = model("Order", orderSchema)

export { orderModel };