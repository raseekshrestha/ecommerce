import asyncHandler from "express-async-handler";
import { userModel } from "../models/users.model.js";
import validator from "validator";
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from "../utils/ApiResponse.js";

const createUser = asyncHandler(async (req, res) => {
    const { username, email, password, userType } = req.body;
    if (await userModel.countDocuments({ $or: [{ username }, { email }] }) >= 1) {
        throw new ApiError(400, "User already registered")
    }
    const user = await userModel.create({ username, email, password, userType })

    const resUser = await userModel.findOne({ _id: user._id }).select("-password")
    res.json(new ApiResponse(201, "User created", resUser))

})



const loginUser = asyncHandler(async (req, res) => {
    const { usernameOrEmail, password } = req.body;
    const query = validator.isEmail(usernameOrEmail) ? { email: usernameOrEmail } : { username: usernameOrEmail }
    const user = await userModel.findOne(query);
    if (user && await user.matchPassword(password)) {
        const reqFields = user.toObject({
            transform: (doc, ret, option) => {
                delete ret.password;
                return ret;
            }
        })
        const token = await user.generateAccessToken({ _id: user._id })
        res.json(new ApiResponse(200, "login success", { ...reqFields, token }))
    } else {
        throw new ApiError(403, "email or password error")
    }
})

const editDetails = asyncHandler(async (req, res) => {
    // const {}
})

export { createUser, loginUser }