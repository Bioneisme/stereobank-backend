import {Router} from "express";

import fiatController from "../controllers/fiatController";
import authMiddleware from "../middlewares/authMiddleware";

const router: Router = Router();

router.post("/deposit", authMiddleware, fiatController.deposit);
router.get("/callback/:trans", fiatController.callback);

export default router;