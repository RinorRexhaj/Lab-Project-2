import { RequestHandler } from "express";
import { createOrder, getUserOrders } from "../services/OrderService";
import { extractUserId } from "../services/TokenService";

export const placeOrder: RequestHandler = async (req, res) => {
  try {
    const { restaurantId, items, subtotal, deliveryFee, total } = req.body;
    
    if (!restaurantId || !items || items.length === 0 || !subtotal || !deliveryFee || !total) {
      res.status(400).json({ error: "Missing required order information" });
      return;
    }
    
    // Get user ID from token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const userId = extractUserId(token || "");

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    
    // Create the order
    const order = await createOrder(
      userId,
      restaurantId,
      items,
      subtotal,
      deliveryFee,
      total
    );

    if (!order) {
      res.status(500).json({ error: "Failed to create order" });
      return;
    }
    
    res.status(201).json({ order });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getOrderHistory: RequestHandler = async (req, res) => {
  try {
    // Also get user ID from token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const userId = extractUserId(token || "");

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    
    const orders = await getUserOrders(userId);
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
