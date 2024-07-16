import { Router } from 'express';
import validateUser from '../middlewares/userAuth.middleware.js';
import { fieldValidator } from '../middlewares/fieldValidator.middlewares.js';
import { addRating, getUserRatings } from '../controllers/rating.controllers.js';

const router = Router();


// add or update rating
router.post("/:productId", validateUser(), fieldValidator(['star']), addRating)


router.get("/myratings", validateUser(), getUserRatings)




export default router;