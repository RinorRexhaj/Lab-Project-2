import { Router } from "express";
import { createUtilityPayment } from "../controllers/UtilityPaymentController";

const router = Router();

router.post("/", createUtilityPayment);

export default router;
