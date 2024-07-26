import { Router } from 'express';
import validateUser from '../middlewares/userAuth.middleware.js';
import { fieldValidator } from '../middlewares/fieldValidator.middlewares.js';
import {
    addProduct,
    getProductById,
    deleteProductById,
    updateProductById,
    getTopXProductsByViews
} from '../controllers/products.controllers.js';



const router = Router();

// /api/products/
router.post("/",
    validateUser("seller"),
    fieldValidator(["name", "description", "price", "image_urls", "thumbnail_url", "category"]),
    addProduct
);

router.get("/top20", getTopXProductsByViews(20));

router.route("/:productId")
    .get(getProductById)
    .delete(validateUser("seller"), deleteProductById)
    .put(validateUser("seller"), updateProductById)



export default router;