import express from "express";
import { placeOrder, getOrderHistory } from "../controllers/OrderController";

const router = express.Router();

// Place a new order
router.post("/", placeOrder);

// Get order history for the current user
router.get("/history", getOrderHistory);

export default router;
