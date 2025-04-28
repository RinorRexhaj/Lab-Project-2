import { Router } from 'express';
import { GroceryController } from '../controllers/GroceryController';

const router = Router();

// Get all grocery stores
router.get('/', GroceryController.getAllGroceryStores);

// Get a grocery store by ID with its products
router.get('/:id/products', GroceryController.getGroceryStoreWithProducts);

// Create a new grocery store (admin only)
router.post('/', GroceryController.createGroceryStore);

// Create a new product category for a store (admin only)
router.post('/:storeId/categories', GroceryController.createProductCategory);

// Create a new product for a category (admin only)
router.post('/categories/:categoryId/products', GroceryController.createProduct);

export default router;
