import { ApiError } from "../utils/ApiError.js";

const notFound = (req, res, next) => {
    throw new ApiError(404, "404 not found " + req.originalUrl)
}

const errorMiddleware = (err, req, res, next) => {
    // res.json(err)
    const statusCode = err.statusCode ? err.statusCode : 500;

    res.status(statusCode)
    res.json({
        message: err.message,
        success: false,
        stack: process.env.NODE_ENV == "prod" ? null : err.stack
    })
}

export { notFound, errorMiddleware };