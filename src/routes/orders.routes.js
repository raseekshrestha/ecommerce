import { Router } from "express";
import validateUser from "../middlewares/userAuth.middleware.js";
import { fieldValidator } from "../middlewares/fieldValidator.middlewares.js";
import { createOrder } from "../controllers/order.controllers.js";

const router = Router();


router.post("/", validateUser(), fieldValidator(['items']), createOrder);

export default router;