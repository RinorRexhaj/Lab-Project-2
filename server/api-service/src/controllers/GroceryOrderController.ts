import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Path to mock data
const mockDataPath = path.join(__dirname, '../mockData/groceryOrders.json');

export class GroceryOrderController {
  /**
   * Create a new grocery order
   */
  public static async createOrder(req: Request, res: Response): Promise<void> {
    try {
      // Initialize orders file if it doesn't exist
      if (!fs.existsSync(mockDataPath)) {
        fs.writeFileSync(mockDataPath, JSON.stringify({ orders: [] }, null, 2));
      }
      
      // Read current data
      const rawData = fs.readFileSync(mockDataPath, 'utf8');
      const data = JSON.parse(rawData);
      
      const orderData = req.body;
      
      // Add ID and created date
      const newOrder = {
        ...orderData,
        id: Math.floor(Math.random() * 10000) + 1,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      
      // Add to orders array
      data.orders.push(newOrder);
      
      // Write back to file
      fs.writeFileSync(mockDataPath, JSON.stringify(data, null, 2));
      
      // Simulate a delay for processing
      setTimeout(() => {
        res.status(201).json({ order: newOrder });
      }, 800);
    } catch (error) {
      console.error('Error creating grocery order:', error);
      res.status(500).json({ message: 'Error creating grocery order' });
    }
  }

  /**
   * Get order history for the current user
   */
  public static async getUserOrders(req: Request, res: Response): Promise<void> {
    try {
      // Check if orders file exists
      if (!fs.existsSync(mockDataPath)) {
        res.status(200).json({ orders: [] });
        return;
      }
      
      // Read orders data
      const rawData = fs.readFileSync(mockDataPath, 'utf8');
      const data = JSON.parse(rawData);
      
      // Return all orders (in a real app, we'd filter by user ID)
      res.status(200).json({ orders: data.orders || [] });
    } catch (error) {
      console.error('Error fetching user order history:', error);
      res.status(500).json({ message: 'Error fetching user order history' });
    }
  }
}
