import { Router } from "express";
import { esewaSuccess, esewaFailure } from "../controllers/paymentConfirmation.controllers.js";

const router = Router();

router.get("/esewasuccess", esewaSuccess);

router.get("/esewafailure", esewaFailure);

export default router;