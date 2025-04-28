import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Path to mock data
const mockDataPath = path.join(__dirname, '../mockData/groceryStores.json');

export class GroceryController {
  /**
   * Get all grocery stores
   */
  public static async getAllGroceryStores(req: Request, res: Response): Promise<void> {
    try {
      // Read mock data
      const rawData = fs.readFileSync(mockDataPath, 'utf8');
      const data = JSON.parse(rawData);
      
      // Filter by category if specified
      const { category } = req.query;
      let stores = data.stores;
      
      if (category && category !== 'All') {
        stores = stores.filter((store: any) => 
          store.category && store.category.toLowerCase() === (category as string).toLowerCase()
        );
      }
      
      res.status(200).json({ stores });
    } catch (error) {
      console.error('Error fetching grocery stores:', error);
      res.status(500).json({ message: 'Error fetching grocery stores' });
    }
  }

  /**
   * Get a grocery store by ID with its products
   */
  public static async getGroceryStoreWithProducts(req: Request, res: Response): Promise<void> {
    try {
      const storeId = parseInt(req.params.id);
      
      // Read mock data
      const rawData = fs.readFileSync(mockDataPath, 'utf8');
      const data = JSON.parse(rawData);
      
      // Find the store by ID
      const store = data.stores.find((s: any) => s.id === storeId);
      
      if (!store) {
        res.status(404).json({ message: 'Grocery store not found' });
        return;
      }
      
      res.status(200).json({ store });
    } catch (error) {
      console.error('Error fetching grocery store details:', error);
      res.status(500).json({ message: 'Error fetching grocery store details' });
    }
  }

  /**
   * Create a new grocery store
   */
  public static async createGroceryStore(req: Request, res: Response): Promise<void> {
    try {
      // Read current data
      const rawData = fs.readFileSync(mockDataPath, 'utf8');
      const data = JSON.parse(rawData);
      
      const storeData = req.body;
      
      // Generate a new ID
      const maxId = Math.max(...data.stores.map((s: any) => s.id), 0);
      const newStore = {
        ...storeData,
        id: maxId + 1
      };
      
      // Add to stores array
      data.stores.push(newStore);
      
      // Write back to file
      fs.writeFileSync(mockDataPath, JSON.stringify(data, null, 2));
      
      res.status(201).json({ store: newStore });
    } catch (error) {
      console.error('Error creating grocery store:', error);
      res.status(500).json({ message: 'Error creating grocery store' });
    }
  }

  /**
   * Create a new product category for a store
   */
  public static async createProductCategory(req: Request, res: Response): Promise<void> {
    try {
      // Read current data
      const rawData = fs.readFileSync(mockDataPath, 'utf8');
      const data = JSON.parse(rawData);
      
      const storeId = parseInt(req.params.storeId);
      const { name } = req.body;
      
      // Find the store
      const storeIndex = data.stores.findIndex((s: any) => s.id === storeId);
      if (storeIndex === -1) {
        res.status(404).json({ message: 'Grocery store not found' });
        return;
      }
      
      // Initialize products array if it doesn't exist
      if (!data.stores[storeIndex].products) {
        data.stores[storeIndex].products = [];
      }
      
      // Generate a new category ID
      const categories = data.stores[storeIndex].products || [];
      const maxCategoryId = Math.max(...categories.map((c: any) => c.id), 0);
      
      // Create new category
      const newCategory = {
        id: maxCategoryId + 1,
        name,
        items: []
      };
      
      // Add to store's products
      data.stores[storeIndex].products.push(newCategory);
      
      // Write back to file
      fs.writeFileSync(mockDataPath, JSON.stringify(data, null, 2));
      
      res.status(201).json({ category: newCategory });
    } catch (error) {
      console.error('Error creating product category:', error);
      res.status(500).json({ message: 'Error creating product category' });
    }
  }

  /**
   * Create a new product for a category
   */
  public static async createProduct(req: Request, res: Response): Promise<void> {
    try {
      // Read current data
      const rawData = fs.readFileSync(mockDataPath, 'utf8');
      const data = JSON.parse(rawData);
      
      const categoryId = parseInt(req.params.categoryId);
      const productData = req.body;
      
      // Find the store and category
      let foundCategory = null;
      let storeIndex = -1;
      let categoryIndex = -1;
      
      for (let i = 0; i < data.stores.length; i++) {
        if (!data.stores[i].products) continue;
        
        categoryIndex = data.stores[i].products.findIndex((c: any) => c.id === categoryId);
        if (categoryIndex !== -1) {
          foundCategory = data.stores[i].products[categoryIndex];
          storeIndex = i;
          break;
        }
      }
      
      if (!foundCategory) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
      
      // Generate a new product ID
      const items = foundCategory.items || [];
      const maxProductId = Math.max(...items.map((p: any) => p.id), 0);
      
      // Create new product
      const newProduct = {
        ...productData,
        id: maxProductId + 1,
        categoryId
      };
      
      // Add to category's items
      data.stores[storeIndex].products[categoryIndex].items.push(newProduct);
      
      // Write back to file
      fs.writeFileSync(mockDataPath, JSON.stringify(data, null, 2));
      
      res.status(201).json({ product: newProduct });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Error creating product' });
    }
  }
}
