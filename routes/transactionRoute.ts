import {Router} from "express";
import authMiddleware from "../middlewares/authMiddleware";

import transactionController from "../controllers/transactionController";

const router: Router = Router();

router.post("/callback", transactionController.callback);
router.post("/createAddress", authMiddleware, transactionController.createAddress);
router.post("/sendCrypto", authMiddleware, transactionController.sendCrypto);
router.get("/getBalance", authMiddleware, transactionController.getBalance);
router.get("/getTransactions", authMiddleware, transactionController.getTransactions);
router.get("/getCurrencies", transactionController.getCurrencies);

export default router;