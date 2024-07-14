import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

const validateUser = (req, res, next) => {
    const auth = req.headers?.authorization
    if (!auth || !auth.startsWith("Bearer ")) {
        throw new ApiError(401, "Authorization Header Invalid")
    }

    const token = auth.split(" ")[1]
    const decodedToken = jwt.decode(token, process.env.JWT_SECRET)
    if (decodedToken) {
        req.user = {
            _id: decodedToken._id
        }
        next()

    } else {
        throw new ApiError(401, "Invalid or expired token")
    }

}

export default validateUser