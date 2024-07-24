import { Router } from "express";
import validateUser from "../middlewares/userAuth.middleware.js";
import { fieldValidator } from "../middlewares/fieldValidator.middlewares.js";
import { createCategory, getCategories } from "../controllers/category.controllers.js";


const router = Router();

router.route("/")
    .post(validateUser("staff"), fieldValidator(['name']), createCategory)
    .get(getCategories)


export default router;