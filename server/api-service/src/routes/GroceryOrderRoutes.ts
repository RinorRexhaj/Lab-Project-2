import { Router } from 'express';
import { GroceryOrderController } from '../controllers/GroceryOrderController';

const router = Router();

// Create a new grocery order
router.post('/', GroceryOrderController.createOrder);

// Get order history for the current user
router.get('/history', GroceryOrderController.getUserOrders);

export default router;
