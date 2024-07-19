import asyncHandler from "express-async-handler";
import { commentModel } from "../models/comments.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const addComment = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const { content, parent } = req.body;

    const newComment = await commentModel.create({ product: productId, commentor: req.user._id, parent: parent, content: content })

    res.json(new ApiResponse(201, "Comment Added", newComment));

})

const editComment = asyncHandler(async (req, res) => {
    const commentId = req.params.commentId
    const { content } = req.body;

    const comment = await commentModel.findOne({ _id: commentId });
    if (!comment) {
        throw new ApiError(400, "Comment does not exists")
    }
    if (comment.commentor != req.user._id) {
        throw new ApiError(400, "Not your comment to edit!")
    }
    comment.content = content;
    if (await comment.save()) {
        res.json(new ApiResponse(200, "Comment Edited!", comment))
    } else {
        throw new ApiError(500, "Cannot edit comment")
    }

})

const deleteComment = asyncHandler(async (req, res) => {
    const commentId = req.params.commentId;
    // if the comment has replies, set deleted=true,else delete completely 
    const replycount = await commentModel.countDocuments({ parent: commentId })
    const comment = await commentModel.findOne({ _id: commentId })
    if (!comment) {
        throw new ApiError(404, "comment does not exists")
    }
    if (comment.commentor != req.user._id) {
        throw new ApiError(400, "Not Your Comment to delete");
    }
    let del;
    if (!replycount) {
        del = await commentModel.deleteOne({ _id: commentId })
    } else {
        // comment contains reply
        del = await commentModel.findOneAndUpdate({ _id: commentId }, { $set: { deleted: true, content: "" } })
    }
    res.json(new ApiResponse(204, "comment deleted"))

})

const getGroupedComment = async (productId, parent = null) => {
    const results = [];
    const topComments = await commentModel.find({ product: productId, parent }).populate({
        path: "commentor",
        select: "username"
    })
    for (let comment of topComments) {
        const commentObj = {
            ...comment._doc,
            subComments: []
        }
        commentObj.subComments = await getGroupedComment(productId, comment._id)
        results.push(commentObj)
    }

    return results;
}

const getCommentsOnProduct = asyncHandler(async (req, res) => {
    const productId = req.params.productId;
    const comments = await getGroupedComment(productId, null)
    res.json(new ApiResponse(200, "comments", comments))
})

export { addComment, editComment, deleteComment, getCommentsOnProduct }