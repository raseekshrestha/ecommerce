import { Router } from "express";
import validateUser from "../middlewares/userAuth.middleware.js";
import { addToCart, getUserCartData, removeFromCart } from "../controllers/carts.controllers.js";
// import { fieldValidator } from "../middlewares/fieldValidator.middlewares";


const router = Router();


router.post("/:productId", validateUser(), addToCart);

router.delete("/:productId", validateUser(), removeFromCart);

router.get("", validateUser(), getUserCartData);

export default router;