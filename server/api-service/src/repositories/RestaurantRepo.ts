import { AppDataSource } from "../data-source";
import { Restaurant } from "../models/Restaurant";
import { FoodCategory } from "../models/FoodCategory";
import { FoodItem } from "../models/FoodItem";

export class RestaurantRepo {
  // Get all restaurants
  static async getAllRestaurants(category?: string): Promise<Restaurant[]> {
    const restaurantRepo = AppDataSource.getRepository(Restaurant);
    
    if (category && category !== 'All') {
      return await restaurantRepo.find({ where: { category } }) || [];
    }
    
    return await restaurantRepo.find() || [];
  }

  // Get restaurant by ID
  static async getRestaurantById(id: number): Promise<Restaurant | null> {
    const restaurantRepo = AppDataSource.getRepository(Restaurant);
    return await restaurantRepo.findOne({ where: { id } });
  }

  // Get restaurant with full menu
  static async getRestaurantWithMenu(id: number): Promise<any | null> {
    const restaurantRepo = AppDataSource.getRepository(Restaurant);
    
    // First, get the restaurant
    const restaurant = await restaurantRepo.findOne({ where: { id } });
    if (!restaurant) return null;
    
    // Get all categories for this restaurant
    const categoryRepo = AppDataSource.getRepository(FoodCategory);
    const categories = await categoryRepo.find({ 
      where: { restaurantId: id },
      relations: ["items"],
      order: { id: "ASC" }
    });
    
    // Get items for each category directly to ensure they're loaded
    const itemRepo = AppDataSource.getRepository(FoodItem);
    
    // Create a new array with fully populated categories and items
    const menuWithItems = await Promise.all(categories.map(async (category) => {
      const items = await itemRepo.find({
        where: { categoryId: category.id },
        order: { id: "ASC" }
      });
      
      return {
        ...category,
        items: items
      };
    }));
    
    // Format the result to include menu with categories and items
    return {
      ...restaurant,
      menu: menuWithItems
    };
  }

  // Create a new restaurant
  static async createRestaurant(restaurantData: Partial<Restaurant>): Promise<Restaurant> {
    const restaurantRepo = AppDataSource.getRepository(Restaurant);
    const newRestaurant = restaurantRepo.create(restaurantData);
    return await restaurantRepo.save(newRestaurant);
  }

  // Update an existing restaurant
  static async updateRestaurant(id: number, restaurantData: Partial<Restaurant>): Promise<Restaurant | null> {
    const restaurantRepo = AppDataSource.getRepository(Restaurant);
    const restaurant = await restaurantRepo.findOne({ where: { id } });
    
    if (!restaurant) return null;
    
    // Update the restaurant properties
    Object.assign(restaurant, restaurantData);
    
    return await restaurantRepo.save(restaurant);
  }

  // Delete a restaurant and associated menu items
  static async deleteRestaurant(id: number): Promise<boolean> {
    const restaurantRepo = AppDataSource.getRepository(Restaurant);
    const categoryRepo = AppDataSource.getRepository(FoodCategory);
    const itemRepo = AppDataSource.getRepository(FoodItem);
    
    // Find the restaurant
    const restaurant = await restaurantRepo.findOne({ where: { id } });
    if (!restaurant) return false;
    
    // Find all categories for this restaurant
    const categories = await categoryRepo.find({ where: { restaurantId: id } });
    
    // Delete all food items for each category
    for (const category of categories) {
      await itemRepo.delete({ categoryId: category.id });
    }
    
    // Delete all categories
    await categoryRepo.delete({ restaurantId: id });
    
    // Delete the restaurant
    await restaurantRepo.delete(id);
    
    return true;
  }

  // Create a food category
  static async createFoodCategory(restaurantId: number, categoryData: Partial<FoodCategory>): Promise<FoodCategory | null> {
    const restaurantRepo = AppDataSource.getRepository(Restaurant);
    const categoryRepo = AppDataSource.getRepository(FoodCategory);
    
    // Check if restaurant exists
    const restaurant = await restaurantRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant) return null;
    
    // Create the category
    const newCategory = categoryRepo.create({
      ...categoryData,
      restaurantId
    });
    
    return await categoryRepo.save(newCategory);
  }

  // Update a food category
  static async updateFoodCategory(
    restaurantId: number,
    categoryId: number,
    categoryData: Partial<FoodCategory>
  ): Promise<FoodCategory | null> {
    const categoryRepo = AppDataSource.getRepository(FoodCategory);
    
    // Check if category exists and belongs to the restaurant
    const category = await categoryRepo.findOne({ 
      where: { 
        id: categoryId,
        restaurantId
      } 
    });
    
    if (!category) return null;
    
    // Update the category
    Object.assign(category, categoryData);
    
    return await categoryRepo.save(category);
  }

  // Delete a food category and its items
  static async deleteFoodCategory(restaurantId: number, categoryId: number): Promise<boolean> {
    const categoryRepo = AppDataSource.getRepository(FoodCategory);
    const itemRepo = AppDataSource.getRepository(FoodItem);
    
    // Check if category exists and belongs to the restaurant
    const category = await categoryRepo.findOne({ 
      where: { 
        id: categoryId,
        restaurantId
      } 
    });
    
    if (!category) return false;
    
    // Delete all food items in this category
    await itemRepo.delete({ categoryId });
    
    // Delete the category
    await categoryRepo.delete(categoryId);
    
    return true;
  }

  // Create a food item
  static async createFoodItem(
    restaurantId: number,
    categoryId: number,
    itemData: Partial<FoodItem>
  ): Promise<FoodItem | null> {
    const categoryRepo = AppDataSource.getRepository(FoodCategory);
    const itemRepo = AppDataSource.getRepository(FoodItem);
    
    // Check if category exists and belongs to the restaurant
    const category = await categoryRepo.findOne({ 
      where: { 
        id: categoryId,
        restaurantId
      } 
    });
    
    if (!category) return null;
    
    // Make sure imageUrl is properly set
    if (itemData.imageUrl === undefined) {
      itemData.imageUrl = "";
    }
    
    // Create the food item
    const newItem = itemRepo.create({
      ...itemData,
      categoryId
    });
    
    // Log for debugging
    console.log("Creating food item:", newItem);
    
    return await itemRepo.save(newItem);
  }

  // Update a food item
  static async updateFoodItem(
    restaurantId: number,
    categoryId: number,
    itemId: number,
    itemData: Partial<FoodItem>
  ): Promise<FoodItem | null> {
    const categoryRepo = AppDataSource.getRepository(FoodCategory);
    const itemRepo = AppDataSource.getRepository(FoodItem);
    
    // Check if category exists and belongs to the restaurant
    const category = await categoryRepo.findOne({ 
      where: { 
        id: categoryId,
        restaurantId
      } 
    });
    
    if (!category) return null;
    
    // Check if food item exists and belongs to the category
    const foodItem = await itemRepo.findOne({ 
      where: { 
        id: itemId,
        categoryId
      } 
    });
    
    if (!foodItem) return null;
    
    // Update the food item
    Object.assign(foodItem, itemData);
    
    // Log for debugging
    console.log("Updating food item:", foodItem);
    
    return await itemRepo.save(foodItem);
  }

  // Delete a food item
  static async deleteFoodItem(
    restaurantId: number,
    categoryId: number,
    itemId: number
  ): Promise<boolean> {
    const categoryRepo = AppDataSource.getRepository(FoodCategory);
    const itemRepo = AppDataSource.getRepository(FoodItem);
    
    // Check if category exists and belongs to the restaurant
    const category = await categoryRepo.findOne({ 
      where: { 
        id: categoryId,
        restaurantId
      } 
    });
    
    if (!category) return false;
    
    // Check if food item exists and belongs to the category
    const foodItem = await itemRepo.findOne({ 
      where: { 
        id: itemId,
        categoryId
      } 
    });
    
    if (!foodItem) return false;
    
    // Delete the food item
    await itemRepo.delete(itemId);
    
    return true;
  }
}
