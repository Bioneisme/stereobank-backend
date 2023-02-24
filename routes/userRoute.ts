import {Router} from "express";
import authMiddleware from "../middlewares/authMiddleware";

import userController from "../controllers/userController";

const router: Router = Router();

router.get("/getMe", authMiddleware, userController.getMe);
router.post("/register", userController.register);
router.post("/findUser", userController.findUser);
router.post("/login", userController.login);
router.get("/logout", userController.logout);
router.get("/refresh", userController.refresh);

export default router;