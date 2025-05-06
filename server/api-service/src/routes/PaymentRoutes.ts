import { Router } from "express";
import { authenticateToken, isAdmin } from "../services/TokenService";
import { createCheckout, getPayments } from "../controllers/PaymentController";

const router = Router();

router.post("/create-payment-intent", authenticateToken, createCheckout);
router.get("/all", isAdmin, getPayments);

export default router;
