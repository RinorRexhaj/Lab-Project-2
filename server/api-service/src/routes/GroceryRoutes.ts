import express from "express";
import {
  getGroceryStores,
  getGroceryStore,
  getGroceryStoreProducts,
  createGroceryStore,
  updateGroceryStore,
  deleteGroceryStore,
  addGroceryCategory,
  updateGroceryCategory,
  deleteGroceryCategory,
  addGroceryProduct,
  updateGroceryProduct,
  deleteGroceryProduct,
  getGroceryStoreImages,
  getGroceryProductImages
} from "../controllers/GroceryController";
import { authenticateToken, isAdmin } from "../services/TokenService";

const router = express.Router();

// Guest and user routes
router.get("/", authenticateToken, getGroceryStores);
router.get("/:id", authenticateToken, getGroceryStore);
router.get("/:id/products", authenticateToken, getGroceryStoreProducts);

// Admin routes
router.post("/", authenticateToken, isAdmin, createGroceryStore);
router.put("/:id", authenticateToken, isAdmin, updateGroceryStore);
router.delete("/:id", authenticateToken, isAdmin, deleteGroceryStore);

// Grocery category management
router.post("/:id/category", authenticateToken, isAdmin, addGroceryCategory);
router.put("/:id/category/:categoryId", authenticateToken, isAdmin, updateGroceryCategory);
router.delete("/:id/category/:categoryId", authenticateToken, isAdmin, deleteGroceryCategory);

// Grocery product management
router.post("/:id/category/:categoryId/product", authenticateToken, isAdmin, addGroceryProduct);
router.put("/:id/category/:categoryId/product/:productId", authenticateToken, isAdmin, updateGroceryProduct);
router.delete("/:id/category/:categoryId/product/:productId", authenticateToken, isAdmin, deleteGroceryProduct);

// Image resource endpoints
router.get("/images/stores", authenticateToken, getGroceryStoreImages);
router.get("/images/products", authenticateToken, getGroceryProductImages);

export default router;
