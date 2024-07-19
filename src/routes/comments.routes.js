import { Router } from "express";
import validateUser from "../middlewares/userAuth.middleware.js";
import {
    addComment,
    editComment,
    deleteComment,
    getCommentsOnProduct
} from "../controllers/comments.controllers.js";
import { fieldValidator } from "../middlewares/fieldValidator.middlewares.js";

const router = Router();

router.post("/:productId", validateUser(), fieldValidator(['content']), addComment)

router.route("/:productId")
    .post(validateUser(), fieldValidator(['content']), addComment)
    .get(getCommentsOnProduct)

router.route("/:commentId")
    .put(validateUser(), fieldValidator(["content"]), editComment)
    .delete(validateUser(), deleteComment)


export default router;