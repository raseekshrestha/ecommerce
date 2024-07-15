import { Router } from "express";
import { createUser, editDetails, loginUser } from '../controllers/users.controllers.js';
import { fieldValidator } from "../middlewares/fieldValidator.middlewares.js";
import validateUser from "../middlewares/userAuth.middleware.js";

const router = Router();

router.post("/register", fieldValidator(["username", "email", "password", "userType"]), createUser);
router.post("/login", fieldValidator(["usernameOrEmail", "password"]), loginUser);
router.put("/editdetails", validateUser("any"), editDetails);




export default router;