import { AppDataSource } from "../data-source";
import { GroceryStore } from "../models/GroceryStore";
import { GroceryCategory } from "../models/GroceryCategory";
import { GroceryProduct } from "../models/GroceryProduct";

export class GroceryStoreRepo {
  // Get all grocery stores
  static async getAllStores(category?: string): Promise<GroceryStore[]> {
    const storeRepo = AppDataSource.getRepository(GroceryStore);
    
    if (category && category !== 'All') {
      return await storeRepo.find({ where: { category } }) || [];
    }
    
    return await storeRepo.find() || [];
  }

  // Get grocery store by ID
  static async getStoreById(id: number): Promise<GroceryStore | null> {
    const storeRepo = AppDataSource.getRepository(GroceryStore);
    return await storeRepo.findOne({ where: { id } });
  }

  // Get grocery store with full products
  static async getStoreWithProducts(id: number): Promise<any | null> {
    const storeRepo = AppDataSource.getRepository(GroceryStore);
    
    // First, get the grocery store
    const store = await storeRepo.findOne({ where: { id } });
    if (!store) return null;
    
    // Get all categories for this store
    const categoryRepo = AppDataSource.getRepository(GroceryCategory);
    const categories = await categoryRepo.find({ 
      where: { store: { id: id } },
      relations: ["products"],
      order: { id: "ASC" }
    });
    
    // Get products for each category directly to ensure they're loaded
    const productRepo = AppDataSource.getRepository(GroceryProduct);
    
    // Create a new array with fully populated categories and products
    const productsWithItems = await Promise.all(categories.map(async (category) => {
      const products = await productRepo.find({
        where: { category: { id: category.id } },
        order: { id: "ASC" }
      });
      
      return {
        ...category,
        items: products
      };
    }));
    
    // Format the result to include products with categories and items
    return {
      ...store,
      products: productsWithItems
    };
  }

  // Create a new grocery store
  static async createStore(storeData: Partial<GroceryStore>): Promise<GroceryStore> {
    const storeRepo = AppDataSource.getRepository(GroceryStore);
    const newStore = storeRepo.create(storeData);
    return await storeRepo.save(newStore);
  }

  // Update an existing grocery store
  static async updateStore(id: number, storeData: Partial<GroceryStore>): Promise<GroceryStore | null> {
    const storeRepo = AppDataSource.getRepository(GroceryStore);
    const store = await storeRepo.findOne({ where: { id } });
    
    if (!store) return null;
    
    // Update the store properties
    Object.assign(store, storeData);
    
    return await storeRepo.save(store);
  }

  // Delete a grocery store and associated products
  static async deleteStore(id: number): Promise<boolean> {
    const storeRepo = AppDataSource.getRepository(GroceryStore);
    const categoryRepo = AppDataSource.getRepository(GroceryCategory);
    const productRepo = AppDataSource.getRepository(GroceryProduct);
    
    // Find the store
    const store = await storeRepo.findOne({ where: { id } });
    if (!store) return false;
    
    // Find all categories for this store
    const categories = await categoryRepo.find({ where: { store: { id: id } } });
    
    // Delete all products for each category
    for (const category of categories) {
      await productRepo.delete({ category: { id: category.id } });
    }
    
    // Delete all categories
    await categoryRepo.delete({ store: { id: id } });
    
    // Delete the store
    await storeRepo.delete(id);
    
    return true;
  }

  // Create a grocery category
  static async createCategory(storeId: number, categoryData: Partial<GroceryCategory>): Promise<GroceryCategory | null> {
    const storeRepo = AppDataSource.getRepository(GroceryStore);
    const categoryRepo = AppDataSource.getRepository(GroceryCategory);
    
    // Check if store exists
    const store = await storeRepo.findOne({ where: { id: storeId } });
    if (!store) return null;
    
    // Create the category
    const newCategory = categoryRepo.create({
      ...categoryData,
      store
    });
    
    return await categoryRepo.save(newCategory);
  }

  // Update a grocery category
  static async updateCategory(
    storeId: number,
    categoryId: number,
    categoryData: Partial<GroceryCategory>
  ): Promise<GroceryCategory | null> {
    const categoryRepo = AppDataSource.getRepository(GroceryCategory);
    
    // Check if category exists and belongs to the store
    const category = await categoryRepo.findOne({ 
      where: { 
        id: categoryId,
        store: { id: storeId }
      } 
    });
    
    if (!category) return null;
    
    // Update the category
    Object.assign(category, categoryData);
    
    return await categoryRepo.save(category);
  }

  // Delete a grocery category and its products
  static async deleteCategory(storeId: number, categoryId: number): Promise<boolean> {
    const categoryRepo = AppDataSource.getRepository(GroceryCategory);
    const productRepo = AppDataSource.getRepository(GroceryProduct);
    
    // Check if category exists and belongs to the store
    const category = await categoryRepo.findOne({ 
      where: { 
        id: categoryId,
        store: { id: storeId }
      } 
    });
    
    if (!category) return false;
    
    // Delete all products in this category
    await productRepo.delete({ category: { id: categoryId } });
    
    // Delete the category
    await categoryRepo.delete(categoryId);
    
    return true;
  }

  // Create a grocery product
  static async createProduct(
    storeId: number,
    categoryId: number,
    productData: Partial<GroceryProduct>
  ): Promise<GroceryProduct | null> {
    const categoryRepo = AppDataSource.getRepository(GroceryCategory);
    const productRepo = AppDataSource.getRepository(GroceryProduct);
    
    // Check if category exists and belongs to the store
    const category = await categoryRepo.findOne({ 
      where: { 
        id: categoryId,
        store: { id: storeId }
      } 
    });
    
    if (!category) return null;
    
    // Make sure imageUrl is properly set
    if (productData.imageUrl === undefined) {
      productData.imageUrl = "";
    }
    
    // Create the product
    const newProduct = productRepo.create({
      ...productData,
      category
    });
    
    // Log for debugging
    console.log("Creating grocery product:", newProduct);
    
    return await productRepo.save(newProduct);
  }

  // Update a grocery product
  static async updateProduct(
    storeId: number,
    categoryId: number,
    productId: number,
    productData: Partial<GroceryProduct>
  ): Promise<GroceryProduct | null> {
    const categoryRepo = AppDataSource.getRepository(GroceryCategory);
    const productRepo = AppDataSource.getRepository(GroceryProduct);
    
    // Check if category exists and belongs to the store
    const category = await categoryRepo.findOne({ 
      where: { 
        id: categoryId,
        store: { id: storeId }
      } 
    });
    
    if (!category) return null;
    
    // Check if product exists and belongs to the category
    const product = await productRepo.findOne({ 
      where: { 
        id: productId,
        category: { id: categoryId }
      } 
    });
    
    if (!product) return null;
    
    // Update the product
    Object.assign(product, productData);
    
    // Log for debugging
    console.log("Updating grocery product:", product);
    
    return await productRepo.save(product);
  }

  // Delete a grocery product
  static async deleteProduct(
    storeId: number,
    categoryId: number,
    productId: number
  ): Promise<boolean> {
    const categoryRepo = AppDataSource.getRepository(GroceryCategory);
    const productRepo = AppDataSource.getRepository(GroceryProduct);
    
    // Check if category exists and belongs to the store
    const category = await categoryRepo.findOne({ 
      where: { 
        id: categoryId,
        store: { id: storeId }
      } 
    });
    
    if (!category) return false;
    
    // Check if product exists and belongs to the category
    const product = await productRepo.findOne({ 
      where: { 
        id: productId,
        category: { id: categoryId }
      } 
    });
    
    if (!product) return false;
    
    // Delete the product
    await productRepo.delete(productId);
    
    return true;
  }
}
