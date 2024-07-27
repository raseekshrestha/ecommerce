import { Router } from "express";
import validateUser from "../middlewares/userAuth.middleware.js";
import { fieldValidator } from "../middlewares/fieldValidator.middlewares.js";
import { cancelOrder, completeOrder, createOrder, getAllOrders } from "../controllers/order.controllers.js";

const router = Router();


router.route("/")
    .post(validateUser(), fieldValidator(['items', 'paymentMethod']), createOrder)
    .get(validateUser(), getAllOrders)

router.route("/:orderId")
    .post(validateUser("staff"), completeOrder) //only staff can mark an order as delivered
    .put(validateUser(), cancelOrder)


export default router;