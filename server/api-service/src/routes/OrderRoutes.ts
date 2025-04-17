import express from "express";
import { placeOrder, getOrderHistory } from "../controllers/OrderController";
import { authenticateToken } from "../services/TokenService";

const router = express.Router();

// Place a new order
router.post("/", authenticateToken, placeOrder);

// Get order history for the current user
router.get("/history", authenticateToken, getOrderHistory);

export default router;
