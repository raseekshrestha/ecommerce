import { Schema, model } from "mongoose";

const commentSchema = Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
    },
    commentor: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    content: {
        type: String
    },
    deleted: {
        type: Boolean

    }

}, { timestamps: true })


const commentModel = model("Comment", commentSchema);

export { commentModel }