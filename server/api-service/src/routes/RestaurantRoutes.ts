import express from "express";
import {
  getRestaurants,
  getRestaurant,
  getRestaurantMenu
} from "../controllers/RestaurantController";
import { authenticateToken } from "../services/TokenService";

const router = express.Router();

// Get all restaurants
router.get("/", authenticateToken, getRestaurants);

// Get restaurant by ID
router.get("/:id", authenticateToken, getRestaurant);

// Get restaurant with menu
router.get("/:id/menu", authenticateToken, getRestaurantMenu);

export default router;
