import express from "express";
import {
  getRestaurants,
  getRestaurant,
  getRestaurantMenu,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  addFoodCategory,
  updateFoodCategory,
  deleteFoodCategory,
  addFoodItem,
  updateFoodItem,
  deleteFoodItem,
  getRestaurantImages,
  getFoodItemImages
} from "../controllers/RestaurantController";
import { authenticateToken, isAdmin } from "../services/TokenService";

const router = express.Router();

// Guest and user routes
router.get("/", authenticateToken, getRestaurants);
router.get("/:id", authenticateToken, getRestaurant);
router.get("/:id/menu", authenticateToken, getRestaurantMenu);

// Admin routes
router.post("/", authenticateToken, isAdmin, createRestaurant);
router.put("/:id", authenticateToken, isAdmin, updateRestaurant);
router.delete("/:id", authenticateToken, isAdmin, deleteRestaurant);

// Food category management
router.post("/:id/category", authenticateToken, isAdmin, addFoodCategory);
router.put("/:id/category/:categoryId", authenticateToken, isAdmin, updateFoodCategory);
router.delete("/:id/category/:categoryId", authenticateToken, isAdmin, deleteFoodCategory);

// Food item management
router.post("/:id/category/:categoryId/item", authenticateToken, isAdmin, addFoodItem);
router.put("/:id/category/:categoryId/item/:itemId", authenticateToken, isAdmin, updateFoodItem);
router.delete("/:id/category/:categoryId/item/:itemId", authenticateToken, isAdmin, deleteFoodItem);

// Image resource endpoints
router.get("/images/restaurants", authenticateToken, getRestaurantImages);
router.get("/images/food-items", authenticateToken, getFoodItemImages);

export default router;
