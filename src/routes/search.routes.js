import { Router } from "express";
import { searchProduct } from "../controllers/search.controllers.js";

const router = Router();

router.get("/", searchProduct)

export default router;