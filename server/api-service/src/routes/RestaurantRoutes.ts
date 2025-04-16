import express from "express";
import {
  getRestaurants,
  getRestaurant,
  getRestaurantMenu
} from "../controllers/RestaurantController";

const router = express.Router();

// Get all restaurants
router.get("/", getRestaurants);

// Get restaurant by ID
router.get("/:id", getRestaurant);

// Get restaurant with menu
router.get("/:id/menu", getRestaurantMenu);

export default router;
