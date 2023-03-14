import {Router} from "express";
import authMiddleware from "../middlewares/authMiddleware";

import userController from "../controllers/userController";

const router: Router = Router();

router.get("/getMe", authMiddleware, userController.getMe);
router.post("/register", userController.register);
router.post("/sendCode", userController.sendCode);
router.post("/callbackCode", userController.callbackCode);
router.get("/checkPhone/:phone", userController.checkPhone);
router.post("/findUser", userController.findUser);
router.post("/login", userController.login);
router.post("/googleSignIn", userController.googleSignIn);
router.get("/logout", userController.logout);
router.get("/refresh", userController.refresh);
router.post("/activatePromo", authMiddleware, userController.activatePromo);
router.get("/getReferrals", authMiddleware, userController.getMyReferrals);

export default router;