import { Router } from "express";
import validateUser from "../middlewares/userAuth.middleware.js";
import { fieldValidator } from "../middlewares/fieldValidator.middlewares.js";
import { createCoupon, removeCoupon } from "../controllers/coupons.controllers.js";

const router = Router();

router.post("/", validateUser("staff"), fieldValidator(['coupon', 'discount']), createCoupon);

router.delete("/:coupon", validateUser("staff"), removeCoupon);

export default router;
