import { Schema, model } from "mongoose";


const TransactionSchema = new Schema({
    transactionCode: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['COMPLETE', 'PENDING', 'FAILED'],
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    transactionUuid: {
        type: String,
        required: true
    },
    productCode: {
        type: String,
        required: true
    },
    signature: {
        type: String,
        required: true
    }
});

const txnModel = model('Transaction', TransactionSchema);

export { txnModel };
