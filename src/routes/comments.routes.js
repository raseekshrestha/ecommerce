import { Router } from "express";
import validateUser from "../middlewares/userAuth.middleware.js";
import {
    addComment,
    editComment,
    deleteComment
} from "../controllers/comments.controllers.js";
import { fieldValidator } from "../middlewares/fieldValidator.middlewares.js";

const router = Router();

router.post("/:productId", validateUser(), fieldValidator(['content']), addComment)

router.route("/:commentId")
    .put(validateUser(), fieldValidator(["content"]), editComment)
    .delete(validateUser(), deleteComment)


export default router;