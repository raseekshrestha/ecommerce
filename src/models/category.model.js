import { Schema, model } from "mongoose";

const categorySchema = Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: "Category"
    }
})

const categoryModel = model("Category", categorySchema)


export { categoryModel };