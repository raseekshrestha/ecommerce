import { Router } from "express";
import validateUser from "../middlewares/userAuth.middleware.js";
import { fieldValidator } from "../middlewares/fieldValidator.middlewares.js";
import { cancelOrder, createOrder, getAllOrders } from "../controllers/order.controllers.js";

const router = Router();


router.route("/")
    .post(validateUser(), fieldValidator(['items']), createOrder)
    .get(validateUser(), getAllOrders)

router.route("/:orderId")
    .put(validateUser(), cancelOrder)

export default router;